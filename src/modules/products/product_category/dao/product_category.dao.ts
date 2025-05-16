import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class ProductCategoryDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const productCategories = await this.connection.query(`select * from categorias_producto`, []);
    return productCategories;
  }

  async findById(id_categoria_producto: number) {
    const productCategories = await this.connection.query(`select * from categorias_producto where id_categoria_producto=$1 limit 1;`, [id_categoria_producto]);
    return productCategories[0];
  }

}
