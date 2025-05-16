import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { PaymentTypeDao } from '../dao/payment_type.dao';

@Injectable()
export class PaymentTypeService {

  constructor(
    private paymentTypeDao: PaymentTypeDao
  ) { }

  async getAll(): Promise<any> {

    try {
      //1-get
      const sizes = await this.paymentTypeDao.getAll();
      return sizes;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

}
