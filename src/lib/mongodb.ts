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
    if (mongoose.connection.db?.databaseName === 'used_bikes') {
      return cached.conn;
    }
    // If connected to a different database, reset and reconnect to used_bikes
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
      dbName: 'used_bikes',
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
              dbName: 'used_bikes',
            },
          });
        }
        const baseUri = cached.mmsInstance.getUri();
        const cleanUri = baseUri.replace(/\/+$/, '');
        const uri = cleanUri.endsWith('/used_bikes') ? cleanUri : `${cleanUri}/used_bikes`;
        const mmsConn = await mongoose.connect(uri, {
          bufferCommands: false,
          dbName: 'used_bikes',
        });
        return mmsConn;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Torque Two-Wheelers] MongoDB connection error:', message);
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
