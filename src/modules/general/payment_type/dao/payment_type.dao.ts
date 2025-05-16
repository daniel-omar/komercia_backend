import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class PaymentTypeDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const sizes = await this.connection.query(`select * from tipos_pago`, []);
    return sizes;
  }

}
