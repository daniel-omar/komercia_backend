import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { ColorDao } from '../dao/color.dao';

@Injectable()
export class ColorService {

  constructor(
    private colorDao: ColorDao
  ) { }

  async getAll(): Promise<any> {

    try {
      //1-get
      const colors = await this.colorDao.getAll();
      return colors;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async getByProduct(idProducto: number): Promise<any> {

    try {
      //1-get
      const queryParms = await this.colorDao.getFiltersProductColors({ idProducto });

      const colors = await this.colorDao.getProductColorByFilter(queryParms);
      return colors;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async getProductColorByFilter(query: any): Promise<any> {

    try {
      //1-get
      const queryParms = await this.colorDao.getFiltersProductColors(query);

      const colors = await this.colorDao.getProductColorByFilter(queryParms);
      return colors;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

}
