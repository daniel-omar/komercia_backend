import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ExceptionsLoggerFilter } from '@core/exceptions/exceptions-logger.filter';
import { AuthGuard } from '@common/guards/auth.guard';
import { AuthJwtService } from '@modules/auth/services/auth_jwt.service';
import { UserService } from '@modules/users/user/services/user.service';
import { UserDao } from '@modules/users/user/dao/user.dao';
import { ProductsModule } from '@modules/products/products.module';
import { GeneralModule } from '@modules/general/general.module';
import { PaymentTypeModule } from '@modules/general/payment_type/payment_type.module';
import { SaleModule } from '@modules/sales/sale/sale.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT!) || 5432,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      // logging: true,
      synchronize: false,
      ssl: process.env.POSTGRES_SSL === "true",
      extra: {
        ssl:
          process.env.POSTGRES_SSL === "true"
            ? {
              rejectUnauthorized: false,
            }
            : null,
      },
    }),

    HttpModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    GeneralModule,
    SaleModule
  ],
  controllers: [AppController],
  providers: [
    AppService,

    AuthJwtService,
    UserService,
    UserDao,

    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class AppModule { }
