import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto } from '../dto/index';

import { UserDao } from '../dao/user.dao';
import { User } from '@modules/auth/entities/user.entity';
import { PaginationService } from '@common/services/pagination.service';
import { FilterUsersWithPaginationDto } from '../dto/filter-users-with-pagination.dto';
import { Connection } from 'typeorm';
import { DateTime } from 'luxon';

@Injectable()
export class UserService {

  constructor(
    private paginationService: PaginationService,
    private userDao: UserDao,
    private connection: Connection
  ) { }

  async create(createUserDto: CreateUserDto): Promise<any> {

    try {
      // createUserDto.clave = createUserDto.numero_documento;
      const { clave, ...userData } = createUserDto;

      //1-Encriptar password
      let newUser = {
        clave: bcryptjs.hashSync(clave, 10),
        ...userData
      };

      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');
      newUser.fecha_hora_registro = fechaHoraRegistro;
      //2-Guardar
      newUser = await this.userDao.create(newUser);

      //3-Generar el JWT
      const { clave: _, ...user } = newUser;

      return user;

    } catch (error) {
      console.log(error.message)
      if (error.code == 11000) {
        throw new BadRequestException(`${createUserDto.correo} already exists!`)
      }
      throw new InternalServerErrorException(error.message);
    }

  }

  async findById(idUsuario: number): Promise<User> {
    let user = await this.userDao.findById(idUsuario);
    user = {
      ...user,
      perfil: {
        id_perfil: user.id_perfil,
        nombre_perfil: user.nombre_perfil
      },
      tipo_documento: {
        id_tipo_documento: user.id_tipo_documento,
        nombre_tipo_documento: user.nombre_tipo_documento,
      },
    }

    return user;
  }

  async getByIdProfile(idPerfil: number): Promise<any> {
    // console.log(idSale)
    try {
      let users = await this.userDao.getByIdProfile(idPerfil);

      return users;
    } catch (error) {
      return []
    }

  }

  async getByFilterWithPagination({ pagination, filter }: FilterUsersWithPaginationDto): Promise<any> {
    pagination.per_page = pagination.per_page > 0 ? pagination.per_page : 10;
    pagination.new_page = pagination.new_page > 0 ? pagination.new_page : 1;
    pagination.start = (pagination.new_page - 1) * pagination.per_page;

    const queryParams = this.userDao.getFiltersUsers(filter);
    let users = await this.userDao.getByFilterWithPagination(queryParams, pagination);
    users = users.map(x => {
      return {
        id_usuario: x.id_usuario,
        nombre: x.nombre,
        apellido_paterno: x.apellido_paterno,
        apellido_materno: x.apellido_materno,
        numero_documento: x.numero_documento,
        id_tipo_documento: x.id_tipo_documento,
        tipo_documento: {
          id_tipo_documento: x.id_tipo_documento,
          nombre_tipo_documento: x.nombre_tipo_documento,
        },
        id_perfil: x.id_perfil,
        perfil: {
          id_perfil: x.id_perfil,
          nombre_perfil: x.nombre_perfil,
        },
        correo: x.correo,
        numero_telefono: x.numero_telefono,
        es_activo: x.es_activo,
        fecha_hora_registro: x.fecha_hora_registro,
        fecha_hora_actualizacion: x.fecha_hora_actualizacion
      }
    })

    const paginationResponse = await this.paginationService.getPaginationWithFilters({
      query: `select 
            count(u.id_usuario) total
        from usuarios u
        ${queryParams.query}`, params: queryParams.params
    }, pagination);

    return {
      usuarios: users,
      paginacion: paginationResponse
    };
  }

  async updateActive(body: any): Promise<void> {

    const { id_usuario, es_activo, id_usuario_registro } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log(body)
    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const updateActiveResponse = await this.userDao.updateActive({
        id_usuario: id_usuario,
        es_activo: es_activo,
        id_usuario_registro,
        fecha_hora_actualizacion: fechaHoraRegistro
      }, queryRunner);

      if (updateActiveResponse.errors) throw Error(updateActiveResponse.errors);
      console.log(updateActiveResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  async update(body: any): Promise<void> {

    const { id_usuario, nombre, apellido_paterno, apellido_materno, id_tipo_documento, numero_documento, id_perfil, correo, numero_telefono, id_usuario_registro } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(body);

    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const updateResponse = await this.userDao.update({
        id_usuario,
        nombre: nombre.trim(),
        apellido_paterno: apellido_paterno.trim(),
        apellido_materno: apellido_materno.trim(),
        id_tipo_documento,
        numero_documento: numero_documento.trim(),
        id_perfil,
        correo,
        numero_telefono: numero_telefono ? numero_telefono.trim() : numero_telefono,
        id_usuario_registro,
        fecha_hora_actualizacion: fechaHoraRegistro
      }, queryRunner);
      console.log(updateResponse);

      if (updateResponse.errors) throw Error(updateResponse.errors);
      console.log(updateResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }
}
