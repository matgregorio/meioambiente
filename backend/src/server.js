import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './db/connection.js';
import { logger } from './config/logger.js';

async function bootstrap() {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      logger.info(`🚀 Servidor iniciado na porta ${env.port}`);
    });
  } catch (err) {
    logger.error('Erro ao iniciar servidor', err);
    process.exit(1);
  }
}

bootstrap();
