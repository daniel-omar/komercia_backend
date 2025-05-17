import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { ProductDao } from '../dao/product.dao';

@Injectable()
export class ProductService {

  constructor(
    private productDao: ProductDao
  ) { }

  async getAll(): Promise<any> {

    try {
      const products = await this.productDao.getAll();
      return products;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async find(filter: any): Promise<any> {
    console.log(filter)
    const queryParams = this.productDao.getFiltersProduct(filter);
    console.log(queryParams)
    const product = await this.productDao.find(queryParams);
    return product;
  }

  async getByFilter(filter: any): Promise<any> {
    const queryParams = this.productDao.getFiltersProducts(filter);
    let products = await this.productDao.getByFilter(queryParams);
    products = products.map(x => {
      return {
        id_producto: x.id_producto,
        codigo_producto: x.codigo_producto,
        nombre_producto: x.nombre_producto,
        descripcion_producto: x.descripcion_producto,
        precio_compra: x.precio_compra,
        precio_venta: x.precio_venta,
        id_categoria_producto: x.id_categoria_producto,
        categoria: {
          id_categoria_producto: x.id_categoria_producto,
          nombre_categoria: x.nombre_categoria
        },
        cantidad_disponible: x.cantidad_total
      }
    })

    return products;
  }

}
