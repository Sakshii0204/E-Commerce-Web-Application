import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (uri = env.MONGODB_URI) => {
  try {
    const conn = await mongoose.connect(uri);

    const safeHost = conn.connection.host;
    const safeDbName = conn.connection.name;
    console.log(`[DB] Connected successfully to MongoDB: ${safeHost}/${safeDbName}`);

    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error(`[DB] MongoDB initial connection failed: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[DB] Disconnected from MongoDB');
  } catch (error) {
    console.error('[DB] Error during disconnection:', error.message);
  }
};
