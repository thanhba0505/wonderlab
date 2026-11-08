import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { APP_VERSION } from './common/version';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger('WonderlabServer');
  const app = await NestFactory.create(AppModule);

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

  // Alias root (/) and (/health) requests to /api/v1/health for versatile health checking
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
      req.url = '/api/v1/health';
    }
    next();
  });

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Uniform Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe with structured field error extraction
  app.useGlobalPipes(createValidationPipe());

  // Dynamic CORS Configuration from Environment & Active Service Connections
  const defaultOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:4100', 'http://localhost:4200'];

  const dynamicOrigins = new Set<string>(defaultOrigins);
  try {
    const prisma = app.get(PrismaService);
    const activeConnections = await prisma.serviceConnection.findMany({
      where: { isActive: true },
      select: { corsOrigin: true },
    });
    for (const conn of activeConnections) {
      if (conn.corsOrigin) {
        conn.corsOrigin
          .split(',')
          .map(s => s.trim())
          .forEach(origin => {
            if (origin) dynamicOrigins.add(origin);
          });
      }
    }
  } catch (err) {
    logger.warn(`Could not load dynamic CORS origins from database: ${(err as Error).message}`);
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || dynamicOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
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

  const port = parseInt(process.env.SERVER_PORT || '4101', 10);
  await app.listen(port);
  logger.log(`Wonderlab server listening on port ${port} (API: /api/v1)`);
}

void bootstrap();
