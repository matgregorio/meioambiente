import dotenv from 'dotenv';

const envFound = dotenv.config();
if (envFound.error) {
  process.env.PORT = process.env.PORT || 8080;
}

const required = ['MONGO_URI', 'JWT_SECRET', 'BASE_URL'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Variável de ambiente ${key} não definida. Usando valor default.`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/recolhafacil',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  uploadsDir: process.env.UPLOADS_DIR || './uploads',
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_SCHEDULE_WINDOW || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_SCHEDULE_MAX || '10', 10)
};
