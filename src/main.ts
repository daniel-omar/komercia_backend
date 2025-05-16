import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ExceptionsLoggerFilter } from '@core/exceptions/exceptions-logger.filter';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@core/interceptors/response.interceptor';
import { AllExceptionsFilter } from '@core/exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = process.env.GLOBAL_PREFIX!;
  app.setGlobalPrefix(globalPrefix);

  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('ISICOM API docs')
    .addServer(`http://${process.env.IP_HOST}:${process.env.PORT}/api`)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('users')
    .setVersion('0.5')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(process.env.GLOBAL_PREFIX_API!, app, document);

  app.useGlobalInterceptors(new ResponseInterceptor());

  const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new ExceptionsLoggerFilter(httpAdapter));
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
