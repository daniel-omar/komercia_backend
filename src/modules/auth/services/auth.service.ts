import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';


import * as bcryptjs from 'bcryptjs';

import { LoginDto } from '../dto/login.dto';
import { LoginResponse } from '../interfaces/login-response.interface';

import { AuthDao } from '../dao/auth.dao';
import { AuthJwtService } from './auth_jwt.service';

@Injectable()
export class AuthService {

  constructor(
    private authJwtService: AuthJwtService,
    private authDao: AuthDao
  ) { }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

    // const clave = bcryptjs.hashSync(loginDto.clave, 10);
    const usuario = await this.authDao.login(loginDto);

    if (!usuario) {
      throw new UnauthorizedException("Credencial de correo no válida");
    }

    if (!bcryptjs.compareSync(loginDto.clave, usuario.clave)) {
      throw new UnauthorizedException("Credencial de contraseña no válida");
    }

    const { clave: _, ...rest } = usuario;

    return {
      usuario: rest,
      token: this.authJwtService.getJwtToken({ id_usuario: usuario.id_usuario })
    };
  }

}
