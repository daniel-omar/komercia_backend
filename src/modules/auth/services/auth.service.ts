import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';


import * as bcryptjs from 'bcryptjs';

import { LoginDto } from '../dto/login.dto';
import { LoginResponse } from '../interfaces/login-response.interface';

import { AuthDao } from '../dao/auth.dao';
import { AuthJwtService } from './auth_jwt.service';
import { TokenResponse } from '../interfaces/token-response.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private authJwtService: AuthJwtService,
    private authDao: AuthDao
  ) { }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

    // const clave = bcryptjs.hashSync(loginDto.clave, 10);
    let usuario = await this.authDao.login(loginDto);

    if (!usuario) {
      throw new UnauthorizedException("Credencial de correo no válida");
    }

    if (!bcryptjs.compareSync(loginDto.clave, usuario.clave)) {
      throw new UnauthorizedException("Credencial de contraseña no válida");
    }

    const token = this.authJwtService.getJwtToken({ id_usuario: usuario.id_usuario });
    const refreshToken = this.authJwtService.getRefreshToken({ id_usuario: usuario.id_usuario });

    await this.authDao.saveRefreshToken(usuario.id_usuario, refreshToken);

    const { clave: _, ...rest } = usuario;

    return {
      usuario: rest,
      token,
      refreshToken
    };
  }

  async getPermissions(id_perfil, id_aplicacion): Promise<any> {

    const permissions = await this.authDao.getPermissions(id_perfil, id_aplicacion);
    const permissionsGroup = permissions.reduce((acc, row) => {
      const { id_menu, nombre_menu, descripcion_menu, ruta_menu, icono_menu, nombre_accion, id_menu_padre } = row;
      const existente = acc.find(p => p.id_menu === id_menu);
      if (existente) {
        if (!existente.acciones.includes(nombre_accion)) {
          existente.acciones.push(nombre_accion);
        }
      } else {
        acc.push({ id_menu, nombre_menu, descripcion_menu, ruta_menu, icono_menu, id_menu_padre, acciones: [nombre_accion] });
      }
      return acc;
    }, []);

    return permissionsGroup;
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {

    const payload = await this.authJwtService.verifyRefreshToken({ refreshToken });

    // Opcional: validar que esté guardado en tu base de datos
    const isValid = await this.authDao.verifyRefreshToken(payload.id_usuario, refreshToken);
    if (!isValid) throw new UnauthorizedException('Refresh token no válido');

    const newAccessToken = this.authJwtService.getJwtToken({ id_usuario: payload.id_usuario });

    return {
      token: newAccessToken
    };
  }

  async findById(idUsuario: number): Promise<User> {
    let user = await this.authDao.findById(idUsuario);
    user = {
      ...user,
      perfil: {
        id_perfil: user.id_perfil,
        nombre_perfil: user.nombre_perfil
      }
    }

    return user;
  }

}
