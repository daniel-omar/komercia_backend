import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { ProfileDao } from './dao/profile.dao';
import { ProfileController } from './profile.controller';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileDao
  ],
  imports: []
})
export class ProfileModule { }
