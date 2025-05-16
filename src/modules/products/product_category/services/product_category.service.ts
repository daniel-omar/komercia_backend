import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { ProductCategoryDao } from '../dao/product_category.dao';

@Injectable()
export class ProductCategoryService {

  constructor(
    private productCategoryDaoDao: ProductCategoryDao
  ) { }

  async getAll(): Promise<any> {

    try {
      //1-get
      const productCategories = await this.productCategoryDaoDao.getAll();
      return productCategories;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async findById(id_categoria_producto: number): Promise<any> {
    const productCategory = await this.productCategoryDaoDao.findById(id_categoria_producto);
    return productCategory;
  }

}
