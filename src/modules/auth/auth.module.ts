import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthDao } from './dao/auth.dao';
import { AuthJwtService } from './services/auth_jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthDao,

    AuthJwtService,

  ],
  imports: [
    ConfigModule.forRoot(),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '24h' }
    })
  ]
})
export class AuthModule { }
