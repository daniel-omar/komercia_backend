import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { PeriodDao } from '../dao/period.dao';
import { Objects } from '@common/constants/objects';

@Injectable()
export class PeriodService {

  constructor(
    private periodDao: PeriodDao
  ) { }

  async getAll(): Promise<any> {

    try {
      //1-get
      const sizes = await this.periodDao.getAll();
      return sizes;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async getToFilters(): Promise<any> {

    try {
      //1-get
      let days = await this.periodDao.getDaysToFilter();
      days = days.map(x => {
        return {
          anio: x.anio,
          mes: x.mes,
          semana: x.semana,
          dia: x.dia,
          fecha_inicio: x.fecha,
          fecha_fin: x.fecha,
          etiqueta: `${x.dia} ${Objects.Meses[x.mes - 1].shortName}`
        }
      });

      let weeks = await this.periodDao.getWeeksToFilter();
      weeks = weeks.map(x => {
        return {
          anio: x.anio,
          mes: x.mes,
          semana: x.semana,
          fecha_inicio: x.fecha_inicio,
          fecha_fin: x.fecha_fin,
          etiqueta: `${this.formatDate(x.fecha_inicio)} - ${this.formatDate(x.fecha_fin)}`
        }
      });
      weeks.reverse();

      let months = await this.periodDao.getMonthsToFilter();
      months = months.map(x => {
        const dates = this.getFirstAndLastDateOfMonth(x.anio, x.mes)
        return {
          anio: x.anio,
          mes: x.mes,
          fecha_inicio: dates.firstDay,
          fecha_fin: dates.lastDay,
          etiqueta: Objects.Meses[x.mes - 1].name
        }
      });
      months.reverse();

      let years = await this.periodDao.getYearsToFilter();
      years = years.map(x => {
        return {
          anio: x.anio,
          fecha_inicio: `${x.anio}-01-01`,
          fecha_fin: `${x.anio}-12-31`,
          etiqueta: x.anio.toString()
        }
      });
      years.reverse();

      return {
        dias: days,
        semanas: weeks,
        meses: months,
        anios: years
      };

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    console.log(date)
    const day = date.getDate()+1; // Día del mes
    const month = Objects.Meses[date.getMonth()].shortName; // Nombre del mes
    return `${day} ${month}`; // Retorna el formato "día de mes"
  };

  getFirstAndLastDateOfMonth(year, month) {
    // Primer día del mes
    const firstDay = new Date(year, month - 1, 1); // Recuerda que los meses en JS empiezan desde 0
    // Último día del mes
    const lastDay = new Date(year, month, 0); // El día 0 de un mes da el último día del mes anterior

    return {
      firstDay: firstDay.toISOString().split('T')[0], // Formato YYYY-MM-DD
      lastDay: lastDay.toISOString().split('T')[0] // Formato YYYY-MM-DD
    };
  }
}
