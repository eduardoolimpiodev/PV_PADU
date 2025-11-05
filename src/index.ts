import 'reflect-metadata';
import { initializeDatabase } from './config/database';

async function bootstrap() {
  try {
    await initializeDatabase();
  } catch (error) {
    process.exit(1);
  }
}

bootstrap();
