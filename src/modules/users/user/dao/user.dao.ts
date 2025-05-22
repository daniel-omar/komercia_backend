import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserDao {

  constructor(
    private connection: Connection

  ) { }

  async create({ correo, nombre, apellido_paterno, apellido_materno, clave, id_perfil, id_tipo_documento, numero_documento, numero_telefono }: CreateUserDto): Promise<any> {

    const user = await this.connection.query(`insert into usuarios(
        correo, nombre, apellido_paterno, apellido_materno, id_perfil,id_tipo_documento,numero_documento, numero_telefono,clave
      )
      values($1,$2,$3,$4,$5,$6,$7,$8,$9)
      returning 
        id_usuario,
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        id_tipo_documento,
        numero_documento`, [correo, nombre, apellido_paterno, apellido_materno, id_perfil, id_tipo_documento, numero_documento, numero_telefono, clave]);

    return user[0];

  }

  async findById(id_usuario: number) {

    const user = await this.connection.query(`select u.*,p.nombre_perfil from usuarios u
      inner join perfiles p on p.id_perfil=u.id_perfil
      where id_usuario=$1 limit 1;`, [id_usuario]);

    return user[0];
  }

  async getByIdProfile(id_profile: number, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;

    const response = await connection.query(`
      select 
          id_usuario,
          nombre,
          apellido_paterno,
          apellido_materno,
          numero_documento,
          correo
      from usuarios
      where 
      id_perfil=$1;`, [id_profile]);
    return response;
  }

}
