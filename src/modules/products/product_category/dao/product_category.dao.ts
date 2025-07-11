import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class ProductCategoryDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const productCategories = await this.connection.query(`select * from categorias_producto where es_activo=true order by nombre_categoria`, []);
    return productCategories;
  }

  async getAllV2(): Promise<any> {
    const productCategories = await this.connection.query(`select * from categorias_producto order by nombre_categoria`, []);
    return productCategories;
  }

  async findById(id_categoria_producto: number) {
    const productCategories = await this.connection.query(`select * from categorias_producto where id_categoria_producto=$1 limit 1;`, [id_categoria_producto]);
    return productCategories[0];
  }

  async updateActive(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_categoria_producto, es_activo } = body;
      const response = await connection.query(`update categorias_producto
       set 
           es_activo=$2
       where
       id_categoria_producto=$1
       returning id_categoria_producto;`, [id_categoria_producto, es_activo]);

      return {
        message: 'save success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('save.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async create(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_usuario_registro, nombre_categoria, descripcion_categoria } = body;
      const response = await connection.query(`
      insert into categorias_producto(nombre_categoria,descripcion_categoria)
      values($1,$2)
      returning id_categoria_producto;`, [nombre_categoria, descripcion_categoria]);

      return {
        message: 'create success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('create.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async update(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_usuario_registro, id_categoria_producto, nombre_categoria, descripcion_categoria } = body;
      const response = await connection.query(`update categorias_producto
       set
          nombre_categoria=$2, 
          descripcion_categoria=coalesce($3,descripcion_categoria)
       where
       id_categoria_producto=$1
       returning id_categoria_producto;`, [id_categoria_producto, nombre_categoria, descripcion_categoria]);

      return {
        message: 'update success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('update.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

}
