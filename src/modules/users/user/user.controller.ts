import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { UserService } from './services/user.service';

import { CreateUserDto } from './dto/index';
import { AuthGuard } from '@common/guards/auth.guard';
import { ResponseDto } from 'src/common/interfaces/response.dto';
import { Authorization } from '@core/decorators/authorization.decorator';
import { FilterUsersWithPaginationDto } from './dto/filter-users-with-pagination.dto';
import { User } from '@modules/auth/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users/user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("/create")
  async create(@Request() req: Request, @Body() requestTokenDto: CreateUserDto): Promise<any> {
    const user: User = req["user"];
    requestTokenDto = {
      ...requestTokenDto,
      id_usuario_registro: user.id_usuario
    }
    let response = await this.userService.create(requestTokenDto);
    response;
  }

  @Get("/get_by_id/:id")
  async getById(@Param('id') idUsuario): Promise<any> {
    // throw new NotFoundException("gaa")
    let response = await this.userService.findById(idUsuario);
    const { clave: _, ...rest } = response;
    return rest;
  }


  @Get("/get_by_profile/:id_perfil")
  async getByIdProfile(@Param('id_perfil') idPerfil): Promise<any> {
    // throw new NotFoundException("gaa")
    let response = await this.userService.getByIdProfile(idPerfil);
    return response;
  }

  @Post("/get_by_filter_with_pagination")
  async getByFilterWithPagination(@Body() filterWithPagination: FilterUsersWithPaginationDto): Promise<ResponseDto> {
    let response = await this.userService.getByFilterWithPagination(filterWithPagination);
    return response;

  }

  @Put("/update")
  async update(@Request() req: Request, @Body() body: UpdateUserDto): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.userService.update(body);
    return true;
  }

  @Put("/update_active")
  async updateActive(@Request() req: Request, @Body() body): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.userService.updateActive(body);
    return true;
  }

}
