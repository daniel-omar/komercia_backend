import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

import { QueryParamsDto } from '@common/interfaces/query-params.dto';

@Injectable()
export class DocumentTypeDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll() {

    const response = await this.connection.query(`
      select 
          *
      from tipos_documento`, []);
    return response;
  }

}
