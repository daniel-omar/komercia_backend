import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto } from '../dto/index';

import { UserDao } from '../dao/user.dao';
import { User } from '@modules/auth/entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    private userDao: UserDao
  ) { }

  async create(createUserDto: CreateUserDto): Promise<any> {

    try {

      const { clave, ...userData } = createUserDto;

      //1-Encriptar password
      let newUser = {
        clave: bcryptjs.hashSync(clave, 10),
        ...userData
      };

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
      }
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

}
