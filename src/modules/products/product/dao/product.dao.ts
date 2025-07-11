import { QueryParamsDto } from '@common/interfaces/query-params.dto';
import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { PaginationDto } from '../dto/pagination.dto';

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

  getFiltersProducts(filters: any): QueryParamsDto {
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
    if (filters.es_activo) {
      result.conditions.push(`p.es_activo = $${(result.params.length + 1)}`);
      result.params.push(filters.es_activo);
    }
    if (filters.nombre_producto) {
      result.conditions.push(`p.nombre_producto like ('%'||$${(result.params.length + 1)}||'%')`);
      result.params.push(filters.nombre_producto);
    }
    // result.conditions.push(`p.es_activo = $${(result.params.length + 1)}`);
    // result.params.push(true);

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
          sum(pv.cantidad) cantidad_total,
          p.es_activo
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
      order by p.fecha_hora_actualizacion,p.fecha_hora_registro desc
      ;`, params);
    return products;

  }

  getFiltersProductsVariants(filters): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: '', params: [], conditions: [] };

    if (filters.id_producto != undefined) {
      result.conditions.push(`p.id_producto = $${(result.params.length + 1)}::int`);
      result.params.push(filters.id_producto);
    }
    if (filters.ids_producto != undefined) {
      if (filters.ids_producto.length > 0) {
        result.conditions.push(`p.id_producto = any($${(result.params.length + 1)}::int[])`);
        result.params.push(filters.ids_producto);
      }
    }
    if (filters.ids_producto_variante != undefined) {
      if (filters.ids_producto_variante.length > 0) {
        result.conditions.push(`pv.id_producto_variante = any($${(result.params.length + 1)}::int[])`);
        result.params.push(filters.ids_producto_variante);
      }
    }
    if (filters.es_activo != undefined) {
      result.conditions.push(`pv.es_activo = $${(result.params.length + 1)}`);
      result.params.push(filters.es_activo);
    }
    if (filters.tiene_cantidad != undefined) {
      result.conditions.push(`pv.cantidad>0`);
    }

    if (result.conditions.length > 0) {
      result.query = result.conditions.join(' AND ');
      result.query = `where ${result.query}`;
    }

    return result;
  }

  async getProductVariantsByFilter({ query, params }: QueryParamsDto) {

    const products = await this.connection.query(`
      select 
          pv.id_producto_variante,
          p.id_producto,
          p.nombre_producto,
          pv.codigo_producto_variante,
          pv.id_talla,
          t.nombre_talla,
          t.codigo_talla,
          pv.id_color,
          c.nombre_color,
          c.codigo_color,
          pv.cantidad,
          pv.es_activo,
          p.precio_compra,
          p.precio_venta
      from productos p
      inner join productos_variantes pv on p.id_producto=pv.id_producto
      left join colores c on c.id_color=pv.id_color
      left join tallas t on t.id_talla=pv.id_talla
       ${query}
      order by pv.id_producto_variante asc
      ;`, [...params]);
    return products;

  }

  async update(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_producto, id_usuario_registro, codigo_producto, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto, fecha_hora_actualizacion } = body;
      const response = await connection.query(`update productos
       set 
          id_usuario_actualizacion=$2,
          fecha_hora_actualizacion=$8,
          nombre_producto=$3, 
          descripcion_producto=coalesce($4,descripcion_producto), 
          precio_compra=$5, 
          precio_venta=$6,
          id_categoria_producto=$7
       where
       id_producto=$1
      returning id_producto;`, [id_producto, id_usuario_registro, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto, fecha_hora_actualizacion]);

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

  async updateActive(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_producto, id_usuario_registro, es_activo, fecha_hora_actualizacion } = body;
      const response = await connection.query(`update productos
       set 
           id_usuario_actualizacion=$2,
           fecha_hora_actualizacion=$4,
           es_activo=$3
       where
       id_producto=$1
       returning id_producto;`, [id_producto, id_usuario_registro, es_activo, fecha_hora_actualizacion]);

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

  async save(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_usuario_registro, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto, fecha_hora_registro } = body;
      const response = await connection.query(`
      insert into productos(nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto,id_usuario_registro, fecha_hora_registro)
      values($1,$2,$3,$4,$5,$6,$7)
      returning id_producto;`, [nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto, id_usuario_registro, fecha_hora_registro]);

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

  async saveVariant(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_usuario_registro, id_producto, id_talla, id_color } = body;
      const response = await connection.query(`
      insert into productos_variantes(id_producto,id_talla,id_color,id_usuario_registro)
      values($1,$2,$3,$4)
      returning id_producto_variante,codigo_producto_variante;`, [id_producto, id_talla, id_color, id_usuario_registro]);

      return {
        message: 'save variant success',
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

  async saveVariants(saveVariantsJson, idUsuarioRegistro, fechaHoraRegistro, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const response = await connection.query(`select func_guardar_productos_variantes from func_guardar_productos_variantes($1,$2,$3)`, [saveVariantsJson, idUsuarioRegistro, fechaHoraRegistro]);

      return {
        message: 'save variant success',
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

  async saveBulk({ productos, id_carga, fecha_hora_registro }, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const queryString = `select total_filas,total_filas_incorrectas,observaciones from func_guardar_productos($1,$2,$3)`;
      const saveProductos = await connection.query(queryString, [
        id_carga,
        productos,
        fecha_hora_registro
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

  async saveIncome(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_tipo_ingreso, observacion, id_usuario_registro, fecha_hora_registro } = body;
      const response = await connection.query(`
      insert into ingresos(id_tipo_ingreso,observacion,id_usuario_registro,fecha_hora_registro)
      values($1,$2,$3,$4)
      returning id_ingreso;`, [id_tipo_ingreso, observacion, id_usuario_registro, fecha_hora_registro]);

      return {
        message: 'saveIncome success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('saveIncome.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async saveIncomeDetails({ ingreso_detalles, id_ingreso }, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {
      console.log({ id_ingreso, ingreso_detalles })
      const queryString = `select total_filas,total_filas_incorrectas from func_guardar_ingreso_detalles($1,$2)`;
      const saveProductos = await connection.query(queryString, [
        id_ingreso,
        ingreso_detalles
      ]);

      return {
        message: 'saveIncomeDetails success',
        data: saveProductos[0],
        errors: null,
      };

    } catch (error) {
      console.log('saveIncomeDetails.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async saveIncomeDetailsBulk({ ingreso_detalles, id_ingreso, id_carga }, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {
      console.log({ id_ingreso, ingreso_detalles })
      const queryString = `select total_filas,total_filas_incorrectas from func_guardar_ingreso_detalles_carga($1,$2)`;
      const saveProductos = await connection.query(queryString, [
        id_ingreso,
        ingreso_detalles,
        id_carga
      ]);

      return {
        message: 'saveIncomeDetails success',
        data: saveProductos[0],
        errors: null,
      };

    } catch (error) {
      console.log('saveIncomeDetails.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  getFiltersProductVariant(filters): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: '', params: [], conditions: [] };

    if (filters.id_producto_variante != undefined) {
      result.conditions.push(`pv.id_producto_variante = $${(result.params.length + 1)}`);
      result.params.push(filters.id_producto_variante);
    }
    if (filters.codigo_producto_variante != undefined) {
      result.conditions.push(`pv.codigo_producto_variante = $${(result.params.length + 1)}`);
      result.params.push(filters.codigo_producto_variante);
    }
    if (filters.es_activo != undefined) {
      result.conditions.push(`pv.es_activo = $${(result.params.length + 1)}`);
      result.params.push(filters.es_activo);
    }
    if (filters.tiene_cantidad != undefined) {
      result.conditions.push(`pv.cantidad>0`);
    }
    result.conditions.push(`p.es_activo = $${(result.params.length + 1)}`);
    result.params.push(filters.es_activo);

    if (result.conditions.length > 0) {
      result.query = result.conditions.join(' AND ');
      result.query = `where ${result.query}`;
    }

    return result;
  }

  async findProductVariant({ query, params }: QueryParamsDto) {
    const productVariant = await this.connection.query(`select 
          pv.id_producto_variante,
          p.id_producto,
          p.nombre_producto,
          pv.codigo_producto_variante,
          pv.id_talla,
          t.nombre_talla,
          t.codigo_talla,
          pv.id_color,
          c.nombre_color,
          c.codigo_color,
          pv.cantidad,
          pv.es_activo,
          p.precio_compra,
          p.precio_venta
      from productos p
      inner join productos_variantes pv on p.id_producto=pv.id_producto
      left join colores c on c.id_color=pv.id_color
      left join tallas t on t.id_talla=pv.id_talla
       ${query} limit 1;`, params);
    return productVariant[0];
  }

  async saveOutput(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { observacion, id_usuario_registro, fecha_hora_registro } = body;
      const response = await connection.query(`
      insert into salidas(observacion,id_usuario_registro,fecha_hora_registro)
      values($1,$2,$3)
      returning id_salida;`, [observacion, id_usuario_registro, fecha_hora_registro]);

      return {
        message: 'saveOutput success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('saveOutput.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async saveOutputDetails({ salida_detalles, id_salida }, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {
      console.log({ id_salida, salida_detalles })
      const queryString = `select total_filas,total_filas_incorrectas from func_guardar_salida_detalles($1,$2)`;
      const saveProductos = await connection.query(queryString, [
        id_salida,
        salida_detalles
      ]);

      return {
        message: 'saveOutputDetails success',
        data: saveProductos[0],
        errors: null,
      };

    } catch (error) {
      console.log('saveOutputDetails.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async getByFilterWithPagination({ query, params }: QueryParamsDto, { start, per_page }: PaginationDto) {

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
          sum(pv.cantidad) cantidad_total,
          p.es_activo,
          p.fecha_hora_registro,
          p.fecha_hora_actualizacion
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
      order by p.fecha_hora_actualizacion,p.fecha_hora_registro desc
      OFFSET ${start} LIMIT ${per_page}
      ;`, params);
    return products;

  }

  async getCarga(idCarga: number): Promise<any> {

    const carga = await this.connection.query(`select * from stage.carga where id_carga=$1`, [idCarga]);
    return carga[0];

  }

}
