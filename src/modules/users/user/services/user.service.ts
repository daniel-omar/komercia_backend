import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto } from '../dto/index';

import { UserDao } from '../dao/user.dao';

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

  async findById(id_usuario: number): Promise<any> {
    const user = await this.userDao.findById(id_usuario);

    return user;
  }

}
