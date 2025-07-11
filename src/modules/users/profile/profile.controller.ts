import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';

import { AuthGuard } from '@common/guards/auth.guard';
import { ResponseDto } from 'src/common/interfaces/response.dto';
import { Authorization } from '@core/decorators/authorization.decorator';
import { ProfileService } from './services/profile.service';

@Controller('users/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get("/get_all")
  async getAll(): Promise<any> {
    // throw new NotFoundException("gaa")
    let response = await this.profileService.getAll();
    return response;
  }

}
