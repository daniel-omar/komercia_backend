import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class SizeDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const sizes = await this.connection.query(`select * from tallas where es_activo=$1`, [true]);
    return sizes;
  }

  async getByProduct(idProducto: number): Promise<any> {
    const colors = await this.connection.query(`select distinct t.*,pv.cantidad from productos_variantes pv
    inner join tallas t on t.id_talla=pv.id_talla and t.es_activo=true
    where
    pv.id_producto=$1
    and pv.es_activo=$2
    and pv.cantidad>0;`, [idProducto, true]);
    return colors;
  }

}
