import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { ProductDao } from '../dao/product.dao';
import { Connection } from 'typeorm';

@Injectable()
export class ProductService {

  constructor(
    private productDao: ProductDao,
    private connection: Connection
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

  async getProductVariants(idProducto: number): Promise<any> {
    let productVariants = await this.productDao.getProductVariants(idProducto);
    const resultado = Object.values(
      productVariants.reduce((acc, item) => {
        const idTalla = item.id_talla;

        if (!acc[idTalla]) {
          acc[idTalla] = {
            id_talla: idTalla,
            nombre_talla: item.nombre_talla,
            detalles: [],
          };
        }

        acc[idTalla].detalles.push({
          id_color: item.id_color,
          nombre_color: item.nombre_color,
          cantidad: item.cantidad,
        });

        return acc;
      }, {})
    );

    return resultado;
  }

  async update(body: any): Promise<void> {

    const { id_producto, id_usuario_registro, codigo_producto, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(body);

    try {

      const updateResponse = await this.productDao.update({
        id_producto, id_usuario_registro, codigo_producto: codigo_producto.trim(), nombre_producto: nombre_producto.trim(),
        descripcion_producto: descripcion_producto.trim(), precio_compra, precio_venta, id_categoria_producto
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
