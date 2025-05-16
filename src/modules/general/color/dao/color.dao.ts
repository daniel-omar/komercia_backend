import { QueryParamsDto } from '@common/interfaces/query-params.dto';
import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class ColorDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const colors = await this.connection.query(`select * from colores where es_activo=$1`, [true]);
    return colors;
  }

  getFiltersProductColors(filters): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: `WHERE 1 = 1`, params: [] };

    if (filters.id_producto != undefined) {
      result.query += ` AND pv.id_producto = $${(result.params.length + 1)}`;
      result.params.push(filters.id_producto);
    }
    if (filters.id_talla != undefined) {
      result.query += ` AND pv.id_talla = $${(result.params.length + 1)}`;
      result.params.push(filters.id_talla);
    }
    result.query += ` AND pv.es_activo = $${(result.params.length + 1)}`;
    result.params.push(true);

    return result;
  }

  async getProductColorByFilter({ query, params }: QueryParamsDto): Promise<any> {
    const colors = await this.connection.query(`select distinct c.* from productos_variantes pv
    inner join colores c on c.id_color=pv.id_color and c.es_activo=true
    ${query}`, params);

    return colors;
  }
} 
