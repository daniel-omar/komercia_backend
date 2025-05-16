import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class DiscountTypeDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const sizes = await this.connection.query(`select * from tipos_descuento`, []);
    return sizes;
  }

}
