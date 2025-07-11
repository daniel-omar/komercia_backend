import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserDao } from './dao/user.dao';
import { UserController } from './user.controller';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  controllers: [UserController],
  providers: [
    
    PaginationService,
    UserService,
    UserDao
  ],
  imports: []
})
export class UserModule { }
