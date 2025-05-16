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
    result = { query: `WHERE 1 = 1`, params: [] };

    if (filters.id_producto != undefined) {
      result.query += ` AND p.id_producto = $${(result.params.length + 1)}`;
      result.params.push(filters.id_producto);
    }
    if (filters.codigo_producto != undefined) {
      result.query += ` AND p.codigo_producto = $${(result.params.length + 1)}`;
      result.params.push(filters.codigo_producto);
    }
    return result;
  }

  async find({ query, params }: QueryParamsDto) {

    const products = await this.connection.query(`select * from productos p ${query} limit 1;`, params);
    return products[0];

  }

}
