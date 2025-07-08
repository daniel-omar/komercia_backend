import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class PaginationService {
  constructor(private connection: Connection) { }

  public async getPagination(data) {
    try {
      const counter = await this.connection.query(data.query);
      let numPages = 0;
      let totalItems = 0;
      if (counter[0].total) {
        totalItems = parseInt(counter[0].total);
        numPages = ~~(totalItems / data.per_page);
        numPages += totalItems % data.per_page > 0 ? 1 : 0;
      }

      return {
        total: totalItems,
        pages: numPages,
        current_page: data.page,
        per_page: data.per_page,
      };
    } catch (e) {
      return {
        total: 0,
        pages: 0,
        current_page: 0,
        per_page: 0,
      };
    }
  }
  public async getPaginationWithFilters({ query, params }, pagination) {
    try {
      const counter = await this.connection.query(query, params);
      let numPages = 0;
      let totalItems = 0;
      if (counter[0].total) {
        totalItems = parseInt(counter[0].total);
        numPages = ~~(totalItems / pagination.per_page);
        numPages += totalItems % pagination.per_page > 0 ? 1 : 0;
      }

      return {
        total: totalItems,
        pages: numPages,
        current_page: pagination.new_page,
        per_page: pagination.per_page,
      };
    } catch (e) {
      return {
        total: 0,
        pages: 0,
        current_page: 0,
        per_page: 0,
      };
    }
  }

  public getPaginationWhitoutQuery(total: number, new_page: number, per_page: number) {
    try {

      let numPages = 0;
      let totalItems = total;
      numPages = ~~(totalItems / per_page);
      numPages += totalItems % per_page > 0 ? 1 : 0;

      return {
        total: totalItems,
        pages: numPages,
        current_page: new_page,
        per_page: per_page,
      };

    } catch (error) {
      console.log('Error en ObraPlantaFijaService.getPaginacion:');
      throw error;
    }
  }


}
