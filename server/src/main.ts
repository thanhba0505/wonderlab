import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('WonderlabServer');
  const app = await NestFactory.create(AppModule);

  // Security HTTP Headers
  app.use(helmet());

  // Parse Cookie for HttpOnly Session Tokens
  app.use(cookieParser());

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS Configuration
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:4100'];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger OpenAPI Documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Wonderlab Server API')
      .setDescription(
        'Interactive scientific simulation and paradox exploration engine — API documentation',
      )
      .setVersion('1.0.0')
      .addTag('Health', 'System health checks')
      .addTag('Auth', 'Authentication, session management and user authorization')
      .addCookieAuth('access_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'HttpOnly session cookie chứa JWT token',
      })
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token cho REST clients',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger API documentation enabled at /api/docs');
  }

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = parseInt(process.env.SERVER_PORT || '4101', 10);
  await app.listen(port);
  logger.log(`Wonderlab server listening on port ${port} (API: /api/v1)`);
}

void bootstrap();
