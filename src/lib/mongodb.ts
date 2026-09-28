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
        const isLocalHost = MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost');
        const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

        // Only try connecting if it's not a localhost URI inside a remote serverless cloud
        if (!isServerless || !isLocalHost) {
          try {
            const directConn = await mongoose.connect(MONGODB_URI, opts);
            return directConn;
          } catch (e) {
            console.warn('[Torque Two-Wheelers] Direct MongoDB connection failed:', (e as Error).message);
          }
        }
      }

      // 2. In serverless clouds like Vercel, embedded MongoMemoryServer cannot run
      const isServerlessEnv = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
      if (isServerlessEnv) {
        console.warn('[Torque Two-Wheelers] Running on Vercel without remote MongoDB Atlas. Bypassing embedded daemon.');
        throw new Error('MONGODB_NOT_AVAILABLE');
      }

      // 3. Start / reuse in-process real MongoDB engine (local dev only)
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
        console.error('[Torque Two-Wheelers] Local MongoDB memory server error:', message);
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
