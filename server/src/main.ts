import { Logger, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { APP_VERSION } from './common/version';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { createValidationPipe } from './common/pipes/validation.pipe';

const logger = new Logger('WonderlabServer');

export function configureWonderlabApp(app: INestApplication): void {
  // Security HTTP Headers with CSP adjusted for Swagger UI
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  // Parse Cookie for HttpOnly Session Tokens
  app.use(cookieParser());

  // Alias root (/), (/health), and (/health-full) requests to /api/v1/health* for versatile probing
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
      req.url = '/api/v1/health';
    } else if (req.method === 'GET' && req.url === '/health-full') {
      req.url = '/api/v1/health-full';
    }
    next();
  });

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Uniform Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe with structured field error extraction
  app.useGlobalPipes(createValidationPipe());

  // CORS Configuration
  const defaultOrigins = [
    'http://localhost:4100',
    'http://localhost:3000',
    'https://wonderlab.io.vn',
    'https://www.wonderlab.io.vn',
    'https://wonderlab-client.vercel.app',
    'https://central-gateway-client.vercel.app',
  ];

  const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [];

  const corsOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger OpenAPI Documentation (enabled by default unless DISABLE_SWAGGER=true)
  if (process.env.DISABLE_SWAGGER !== 'true') {
    const config = new DocumentBuilder()
      .setTitle('Wonderlab Server API')
      .setDescription(
        'Interactive scientific simulation and paradox exploration engine — API documentation',
      )
      .setVersion(APP_VERSION)
      .addTag('Health', 'System health checks')
      .addTag('Auth', 'Authentication, session management and user authorization')
      .addTag('Simulations', 'Simulation telemetry, runs history and aggregated stats')
      .addTag('Comments', 'Interactive nested discussion comments')
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
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Wonderlab API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    });
    logger.log('Swagger API documentation enabled at /api/docs');
  }

  // Graceful shutdown hooks
  app.enableShutdownHooks();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureWonderlabApp(app);

  const port = parseInt(process.env.SERVER_PORT || process.env.PORT || '4101', 10);
  await app.listen(port);
  logger.log(`Wonderlab server listening on port ${port} (API: /api/v1)`);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
