import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mmsInstance?: { getUri: () => string } | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Reusable, hot-reload safe MongoDB connection utility for Next.js.
 * Connects to real MongoDB URI (e.g. Atlas / local daemon), or automatically
 * boots an in-process MongoDB instance so the app runs with the authentic
 * MongoDB database engine out-of-the-box.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
    };

    cached.promise = (async () => {
      // 1. Attempt connection to configured MONGODB_URI
      if (MONGODB_URI) {
        try {
          const directConn = await mongoose.connect(MONGODB_URI, opts);
          return directConn;
        } catch {
          // Fall back gracefully to the embedded MongoDB server
        }
      }

      // 2. Start / reuse in-process real MongoDB engine
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!cached.mmsInstance) {
          cached.mmsInstance = await MongoMemoryServer.create({
            instance: {
              dbName: 'aureus_motors',
            },
          });
        }
        const uri = cached.mmsInstance.getUri();
        const mmsConn = await mongoose.connect(uri, {
          bufferCommands: false,
        });
        return mmsConn;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Aureus Motors] MongoDB connection error:', message);
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
