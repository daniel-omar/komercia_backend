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

}
