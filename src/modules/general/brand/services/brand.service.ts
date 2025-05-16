import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { BrandDao } from '../dao/brand.dao';

@Injectable()
export class BrandService {

  constructor(
    private brandDao: BrandDao
  ) { }

  async getAll(): Promise<any> {

    try {
      //1-get
      const brands = await this.brandDao.getAll();
      return brands;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

}
