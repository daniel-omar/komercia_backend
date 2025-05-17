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
      result.conditions.push(`p.id_categoria_producto = any($${(result.params.length + 1)}::int[])`);
      result.params.push(filters.ids_categoria);
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


}
