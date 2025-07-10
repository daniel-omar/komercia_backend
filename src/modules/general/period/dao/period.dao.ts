import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class PeriodDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {
    const sizes = await this.connection.query(`select * from periodos where es_activo=$1`, [true]);
    return sizes;
  }

  async getDaysToFilter(fecha): Promise<any> {
    const colors = await this.connection.query(`
      SELECT 
          to_char(d::date,'YYYY-MM-DD') fecha,
          EXTRACT(DAY FROM d)::int AS dia,
          EXTRACT(WEEK FROM d)::int AS semana,
          EXTRACT(MONTH FROM d)::int AS mes,
          EXTRACT(YEAR FROM d)::int AS anio
      FROM generate_series(($1::date - INTERVAL '13 days'),$1::date, interval '1 day') d
    `, [fecha]);
    return colors;
  }

  async getWeeksToFilter(fecha): Promise<any> {
    const colors = await this.connection.query(`
      select anio,mes,semana,to_char(fecha_inicio,'YYYY-MM-DD') fecha_inicio,to_char(fecha_fin,'YYYY-MM-DD') fecha_fin, etiqueta from periodos 
      where 
      es_activo=$1
      and (fecha_fin::date<=$2::date or fecha_inicio::date<=$2::date)
      order by fecha_fin desc limit 10;
    `, [true, fecha]);
    return colors;
  }

  async getMonthsToFilter(fecha): Promise<any> {
    const colors = await this.connection.query(`
      select anio,mes from periodos 
      where 
      es_activo=$1
      and (fecha_fin::date<=$2::date or fecha_inicio::date<=$2::date) 
      group by anio,mes order by anio,mes desc limit 10;
    `, [true, fecha]);
    return colors;
  }

  async getYearsToFilter(fecha): Promise<any> {
    const colors = await this.connection.query(`
      select anio from periodos 
      where 
      es_activo=$1
      and (fecha_fin::date<=$2::date or fecha_inicio::date<=$2::date) 
      group by anio order by anio desc limit 10;
    `, [true, fecha]);
    return colors;
  }

}
