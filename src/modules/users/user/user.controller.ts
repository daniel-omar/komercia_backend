import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './services/user.service';

import { CreateUserDto } from './dto/index';
import { AuthGuard } from '@common/guards/auth.guard';
import { ResponseDto } from 'src/common/interfaces/response.dto';
import { Authorization } from '@core/decorators/authorization.decorator';

@Controller('users/user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("/create")
  async create(@Request() req: Request, @Body() requestTokenDto: CreateUserDto): Promise<ResponseDto> {

    let response = await this.userService.create(requestTokenDto);
    return {
      status: Number(process.env.STATUS_SERVICES_OK),
      data: response,
      message: "success"
    };
  }

}
