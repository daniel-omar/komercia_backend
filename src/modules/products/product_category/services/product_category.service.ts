import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { ProductCategoryDao } from '../dao/product_category.dao';
import { DateTime } from 'luxon';
import { Connection } from 'typeorm';
import { SaveProductCategoryDto } from '../dto/save-product-category.dto';

@Injectable()
export class ProductCategoryService {

  constructor(
    private productCategoryDaoDao: ProductCategoryDao,
    private connection: Connection
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

  async getAllV2(): Promise<any> {

    try {
      //1-get
      const productCategories = await this.productCategoryDaoDao.getAllV2();
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

  async updateActive(body: any): Promise<void> {

    const { id_usuario_registro, es_activo, id_categoria_producto } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log(body)
    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const updateActiveResponse = await this.productCategoryDaoDao.updateActive({
        id_usuario_registro,
        id_categoria_producto,
        es_activo,
        fecha_hora_actualizacion: fechaHoraRegistro
      }, queryRunner);

      if (updateActiveResponse.errors) throw Error(updateActiveResponse.errors);
      console.log(updateActiveResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async create(body: SaveProductCategoryDto): Promise<void> {

    const { id_usuario_registro, nombre_categoria, descripcion_categoria } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(body);

    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const saveResponse = await this.productCategoryDaoDao.create({
        id_usuario_registro,
        nombre_categoria: nombre_categoria.trim(),
        descripcion_categoria: descripcion_categoria ? descripcion_categoria.trim() : null
      }, queryRunner);
      console.log(saveResponse);

      if (saveResponse.errors) throw Error(saveResponse.errors);
      console.log(saveResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  async update(body: SaveProductCategoryDto): Promise<void> {

    const { id_usuario_registro, id_categoria_producto, nombre_categoria, descripcion_categoria } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(body);

    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const updateResponse = await this.productCategoryDaoDao.update({
        id_usuario_registro,
        id_categoria_producto,
        nombre_categoria: nombre_categoria.trim(),
        descripcion_categoria: descripcion_categoria.trim()
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
