import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('cors.origin') || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle(
      configService.get<string>('swagger.title') || 'Contract Analysis API',
    )
    .setDescription(
      configService.get<string>('swagger.description') ||
        'API for analyzing legal contracts using AI',
    )
    .setVersion(configService.get<string>('swagger.version') || '1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get<number>('port') || 3001;
  await app.listen(port);

  console.log(
    `🚀 Contract Analysis API is running on: http://localhost:${port}`,
  );
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
void bootstrap();
