import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserDao } from './dao/user.dao';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserDao],
  imports: []
})
export class UserModule { }
