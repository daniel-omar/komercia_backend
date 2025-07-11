import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';
import { QueryParamsDto } from '@common/interfaces/query-params.dto';
import { PaginationDto } from '../dto/pagination.dto';

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

  getFiltersUsers(filters: any): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: '', params: [], conditions: [] };

    if (filters.ids_perfil != undefined) {
      if (filters.ids_perfil.length > 0) {
        result.conditions.push(`u.id_perfil = any($${(result.params.length + 1)}::int[])`);
        result.params.push(filters.ids_perfil);
      }
    }
    if (filters.nombre) {
      result.conditions.push(`u.nombre like ('%'||$${(result.params.length + 1)}||'%')`);
      result.params.push(filters.nombre);
    }
    if (filters.numero_documento) {
      result.conditions.push(`u.numero_documento like ('%'||$${(result.params.length + 1)}||'%')`);
      result.params.push(filters.numero_documento);
    }
    if (filters.es_activo) {
      result.conditions.push(`u.es_activo = $${(result.params.length + 1)}`);
      result.params.push(filters.es_activo);
    }

    if (result.conditions.length > 0) {
      result.query = result.conditions.join(' AND ');
      result.query = `where ${result.query}`;
    }

    return result;
  }

  async getByFilterWithPagination({ query, params }: QueryParamsDto, { start, per_page }: PaginationDto) {

    const products = await this.connection.query(`
        select 
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.numero_documento,
            td.id_tipo_documento,
            td.nombre_tipo_documento,
            p.id_perfil,
            p.nombre_perfil,
            u.correo,
            u.numero_telefono,
            u.es_activo,
            u.fecha_hora_registro,
            u.fecha_hora_actualizacion
        from usuarios u
        inner join perfiles p on u.id_perfil=p.id_perfil
        inner join tipos_documento td on u.id_tipo_documento=td.id_tipo_documento
        ${query}
        order by u.fecha_hora_actualizacion desc
        OFFSET ${start} LIMIT ${per_page}
        ;`, params);
    return products;

  }

}
