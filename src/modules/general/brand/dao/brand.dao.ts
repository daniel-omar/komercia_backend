import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class BrandDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const brands = await this.connection.query(`select * from marcas`, []);
    return brands;
  }

}
