import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GenericHttpExceptionFilter } from './shared/generic-http-exception.filter';
import { createStartupDelayMiddleware } from './shared/startup-delay.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.use(createStartupDelayMiddleware());
  app.useGlobalFilters(new GenericHttpExceptionFilter());
  await app.listen(process.env.PORT ?? 4444);
}
bootstrap();
