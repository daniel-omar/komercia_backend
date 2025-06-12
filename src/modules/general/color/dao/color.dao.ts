import { QueryParamsDto } from '@common/interfaces/query-params.dto';
import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class ColorDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const colors = await this.connection.query(`select * from colores where es_activo=$1 order by id_color asc`, [true]);
    return colors;
  }

  getFiltersProductColors(filters): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: '', params: [], conditions: [] };

    if (filters.id_producto != undefined) {
      result.conditions.push(`pv.id_producto = $${(result.params.length + 1)}`);
      result.params.push(filters.id_producto);
    }
    if (filters.id_talla != undefined) {
      result.conditions.push(`pv.id_talla = $${(result.params.length + 1)}`);
      result.params.push(filters.id_talla);
    }
    result.conditions.push(`pv.es_activo = $${(result.params.length + 1)}`);
    result.params.push(true);
    result.conditions.push(`pv.cantidad>0`);

    result.query = result.conditions.join(' AND ');
    result.query = `where ${result.query}`;

    return result;
  }

  async getProductColorByFilter({ query, params }: QueryParamsDto): Promise<any> {
    const colors = await this.connection.query(`select distinct c.*,pv.cantidad from productos_variantes pv
    inner join colores c on c.id_color=pv.id_color and c.es_activo=true 
    ${query}
    order by c.id_color asc`, params);

    return colors;
  }
} 
