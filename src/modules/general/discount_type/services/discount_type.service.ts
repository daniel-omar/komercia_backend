import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { DiscountTypeDao } from '../dao/discount_type.dao';

@Injectable()
export class DiscountTypeService {

  constructor(
    private discountTypeDao: DiscountTypeDao
  ) { }

  async getAll(): Promise<any> {

    try {
      //1-get
      const discountTypes = await this.discountTypeDao.getAll();
      return discountTypes;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

}
