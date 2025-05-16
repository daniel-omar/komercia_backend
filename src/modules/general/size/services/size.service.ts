import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { SizeDao } from '../dao/size.dao';

@Injectable()
export class SizeService {

  constructor(
    private sizeDao: SizeDao
  ) { }

  async getAll(): Promise<any> {

    try {
      //1-get
      const sizes = await this.sizeDao.getAll();
      return sizes;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async getByProduct(idProducto: number): Promise<any> {

    try {
      //1-get
      const sizes = await this.sizeDao.getByProduct(idProducto);
      return sizes;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }
}
