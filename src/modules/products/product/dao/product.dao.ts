import { QueryParamsDto } from '@common/interfaces/query-params.dto';
import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class ProductDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {

    const products = await this.connection.query(`select * from productos`, []);

    return products;

  }

  getFiltersProduct(filters): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: '', params: [], conditions: [] };

    if (filters.id_producto != undefined) {
      result.conditions.push(`p.id_producto = $${(result.params.length + 1)}`);
      result.params.push(filters.id_producto);
    }
    if (filters.codigo_producto != undefined) {
      result.conditions.push(`p.codigo_producto = $${(result.params.length + 1)}`);
      result.params.push(filters.codigo_producto);
    }

    if (result.conditions.length > 0) {
      result.query = result.conditions.join(' AND ');
      result.query = `where ${result.query}`;
    }

    return result;
  }

  async find({ query, params }: QueryParamsDto) {
    const products = await this.connection.query(`select * from productos p ${query} limit 1;`, params);
    return products[0];
  }

  getFiltersProducts(filters): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: '', params: [], conditions: [] };

    if (filters.id_categoria) {
      result.conditions.push(`p.id_categoria_producto = $${(result.params.length + 1)}`);
      result.params.push(filters.id_categoria);
    }
    if (filters.ids_categoria != undefined) {
      if (filters.ids_categoria.length > 0) {
        result.conditions.push(`p.id_categoria_producto = any($${(result.params.length + 1)}::int[])`);
        result.params.push(filters.ids_categoria);
      }
    }
    if (filters.ids_producto != undefined) {
      if (filters.ids_producto.length > 0) {
        result.conditions.push(`p.id_producto = any($${(result.params.length + 1)}::int[])`);
        result.params.push(filters.ids_producto);
      }
    }
    result.conditions.push(`p.es_activo = $${(result.params.length + 1)}`);
    result.params.push(true);

    if (result.conditions.length > 0) {
      result.query = result.conditions.join(' AND ');
      result.query = `where ${result.query}`;
    }

    return result;
  }

  async getByFilter({ query, params }: QueryParamsDto) {

    const products = await this.connection.query(`
      select 
          p.id_producto,
          p.codigo_producto,
          p.nombre_producto,
          p.descripcion_producto,
          p.precio_compra,
          p.precio_venta,
          p.id_categoria_producto,
          cp.nombre_categoria,
          sum(pv.cantidad) cantidad_total
      from productos p
      inner join categorias_producto cp on cp.id_categoria_producto=p.id_Categoria_producto
      left join productos_variantes pv on pv.id_producto=p.id_producto and pv.cantidad>0 and pv.es_activo=true
      ${query}
      group by 
          p.id_producto,
          p.codigo_producto,
          p.nombre_producto,
          p.descripcion_producto,
          p.precio_compra,
          p.precio_venta,
          p.id_categoria_producto,
          cp.nombre_categoria
      ;`, params);
    return products;

  }

  async getProductVariants(idProducto: number) {

    const products = await this.connection.query(`
      select 
          p.id_producto,
          pv.id_talla,
          t.nombre_talla,
          pv.id_color,
          c.nombre_color,
          pv.cantidad
      from productos p
      inner join productos_variantes pv on p.id_producto=pv.id_producto and pv.cantidad>0
      left join colores c on c.id_color=pv.id_color
      left join tallas t on t.id_talla=pv.id_talla
      where
      p.id_producto=$1
      ;`, [idProducto]);
    return products;

  }

  async update(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_producto, id_usuario_registro, codigo_producto, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto } = body;
      const response = await connection.query(`update productos
       set 
          id_usuario_actualizacion=$2,
          fecha_hora_actualizacion=CURRENT_TIMESTAMP,
          codigo_producto=coalesce($3,codigo_producto), 
          nombre_producto=$4, 
          descripcion_producto=coalesce($5,descripcion_producto), 
          precio_compra=$6, 
          precio_venta=$7,
          id_categoria_producto=$8
       where
       id_producto=$1
      returning id_producto;`, [id_producto, id_usuario_registro, codigo_producto, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto]);

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

  async save(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_usuario_registro, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto } = body;
      const response = await connection.query(`
      insert into productos(nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto,id_usuario_registro)
      values($1,$2,$3,$4,$5,$6)
      returning id_producto;`, [nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto, id_usuario_registro]);

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

  async saveBulk({ productos, id_carga }, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const queryString = `select total_filas,total_filas_incorrectas from func_guardar_productos($1,$2)`;
      const saveProductos = await this.connection.query(queryString, [
        id_carga,
        productos
      ]);

      return {
        message: 'saveBulk success',
        data: saveProductos[0],
        errors: null,
      };

    } catch (error) {
      console.log('saveBulk.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }
}
