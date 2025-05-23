import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthDao {

  constructor(
    private connection: Connection

  ) { }

  async login(loginDto: LoginDto): Promise<any> {

    const { correo, clave } = loginDto;

    const user = await this.connection.query(`
      select 
        u.*,
        p.nombre_perfil
      from usuarios u
      inner join perfiles p on p.id_perfil=u.id_perfil
      where correo=$1 limit 1;`, [correo]);

    return user[0];
  }

  async getPermissions(id_perfil: number, id_aplicacion: number): Promise<any> {

    const permissions = await this.connection.query(`
      select 
          p.id_perfil, 
          pf.nombre_perfil,
          m.id_menu,
          m.nombre_menu,
          m.descripcion_menu,
          m.ruta_menu,
          m.icono_menu,
          a.id_accion,
          a.nombre_accion,
          m.id_menu_padre
      from permisos p
      inner join perfiles pf on pf.id_perfil=p.id_perfil
      inner join menus m on m.id_menu=p.id_menu
      inner join acciones a on a.id_accion=p.id_accion
      where
      p.es_activo=true
      and p.id_perfil=$1
      and m.id_aplicacion=$2;`, [id_perfil, id_aplicacion]);

    return permissions;
  }

  async saveRefreshToken(idUsuario: number, token: string): Promise<void> {
    await this.connection.query(`
      INSERT INTO auth_tokens (id_usuario, refresh_token,expire_time,expire_time_refresh)
      VALUES ($1, $2,$3,$4)
    `, [idUsuario, token, process.env.JWT_EXPIRE, process.env.JWT_REFRESH_EXPIRE]);
  }

  async updateApplicationRefreshToken(idUsuario: number, token: string, idAplicacion: number): Promise<void> {
    await this.connection.query(`
      update auth_tokens set
        id_aplicacion=$3,
        fecha_hora_actualizacion=NOW()
      where
      id_usuario=$1
      and refresh_token=$2
    `, [idUsuario, token, idAplicacion]);
  }

  async updateStatusRefreshToken(idUsuario: number, token: string, es_activo: boolean): Promise<void> {
    await this.connection.query(`
      update auth_tokens set
        es_activo=$3,
        fecha_hora_actualizacion=NOW()
      where
      id_usuario=$1
      and refresh_token=$2
    `, [idUsuario, token, es_activo]);
  }


  async verifyRefreshToken(idUsuario: number, token: string): Promise<boolean> {
    const result = await this.connection.query(`
      SELECT * FROM auth_tokens
      WHERE id_usuario = $1 AND refresh_token = $2 AND es_activo = true
    `, [idUsuario, token]);

    return result.length > 0;
  }

} 
