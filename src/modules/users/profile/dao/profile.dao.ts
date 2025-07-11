import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

import { QueryParamsDto } from '@common/interfaces/query-params.dto';

@Injectable()
export class ProfileDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll() {

    const response = await this.connection.query(`
      select 
          *
      from perfiles`, []);
    return response;
  }

}
