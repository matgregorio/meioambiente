import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });
  logger.info('📦 MongoDB conectado');
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
