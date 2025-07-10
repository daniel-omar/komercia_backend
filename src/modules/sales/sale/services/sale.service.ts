import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { SaleDao } from '../dao/sale.dao';
import { Connection, QueryRunner } from 'typeorm';
import { create, all } from 'mathjs';
import { Objects } from '@common/constants/objects';
import { DateTime } from 'luxon';
import { FilterSalesWithPaginationDto } from '../dto/filter-sales-with-pagination.dto';
import { PaginationService } from '@common/services/pagination.service';

@Injectable()
export class SaleService {
  private math;
  constructor(
    private saleDao: SaleDao,
    private connection: Connection,
    private paginationService: PaginationService
  ) {
    this.math = create(all, {
      number: 'BigNumber',
      precision: 64
    });
  }

  async getAll(): Promise<any> {

    try {
      const sales = await this.saleDao.getAll();
      return sales;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async find(filter: any): Promise<any> {
    const queryParams = this.saleDao.getFiltersSale(filter);
    console.log(queryParams)
    let sale = await this.saleDao.find(queryParams);
    sale = {
      id_venta: sale.id_venta,
      concepto: sale.concepto,
      id_tipo_pago: sale.id_tipo_pago,
      tipo_pago: { nombre_tipo_pago: sale.tipo_pago, id_tipo_pago: sale.id_tipo_pago },
      tiene_descuento: sale.tiene_descuento,
      id_tipo_descuento: sale.id_tipo_descuento,
      tipo_descuento: sale.tiene_descuento ? { nombre_tipo_descuento: sale.tipo_descuento, id_tipo_descuento: sale.id_tipo_descuento } : null,
      descuento: sale.descuento,
      total_sugerido: sale.total_sugerido,
      total: sale.total,
      total_final: sale.total_final,
      id_usuario_registro: sale.id_usuario_registro,
      usuario_registro: {
        id_usuario: sale.id_usuario_registro,
        nombre: sale.usuario_registro_nombre,
        apellido_paterno: sale.usuario_registro_apellido_paterno,
        apellido_materno: sale.usuario_registro_apellido_materno
      },
      id_usuario_actualizacion: sale.id_usuario_actualizacion,
      usuario_actualizacion: sale.id_usuario_actualizacion ? {
        id_usuario: sale.id_usuario_actualizacion,
        nombre: sale.usuario_actualizacion_nombre,
        apellido_paterno: sale.usuario_actualizacion_apellido_paterno,
        apellido_materno: sale.usuario_actualizacion_apellido_materno
      } : null,
      fecha_registro: sale.fecha_registro,
      hora_registro: sale.hora_registro,
      fecha_actualizacion: sale.fecha_actualizacion,
      hora_actualizacion: sale.hora_actualizacion
    }
    return sale;
  }

  async getByFilter(filter: any): Promise<any> {
    const queryParams = this.saleDao.getFiltersSale(filter);
    console.log(queryParams)
    let sales = await this.saleDao.getByFilter(queryParams);
    sales = sales.map(x => {
      return {
        id_venta: x.id_venta,
        concepto: x.concepto,
        id_tipo_pago: x.id_tipo_pago,
        tipo_pago: { nombre_tipo_pago: x.tipo_pago, id_tipo_pago: x.id_tipo_pago },
        tiene_descuento: x.tiene_descuento,
        id_tipo_descuento: x.id_tipo_descuento,
        tipo_descuento: x.tiene_descuento ? { nombre_tipo_descuento: x.tipo_descuento, id_tipo_descuento: x.id_tipo_descuento } : null,
        descuento: x.descuento,
        total_sugerido: x.total_sugerido,
        total: x.total,
        total_final: x.total_final,
        id_usuario_registro: x.id_usuario_registro,
        usuario_registro: {
          id_usuario: x.id_usuario_registro,
          nombre: x.usuario_registro_nombre,
          apellido_paterno: x.usuario_registro_apellido_paterno,
          apellido_materno: x.usuario_registro_apellido_materno
        },
        id_usuario_actualizacion: x.id_usuario_actualizacion,
        usuario_actualizacion: x.id_usuario_actualizacion ? {
          id_usuario: x.id_usuario_actualizacion,
          nombre: x.usuario_actualizacion_nombre,
          apellido_paterno: x.usuario_actualizacion_apellido_paterno,
          apellido_materno: x.usuario_actualizacion_apellido_materno
        } : null,
        fecha_registro: x.fecha_registro,
        hora_registro: x.hora_registro,
        fecha_actualizacion: x.fecha_actualizacion,
        hora_actualizacion: x.hora_actualizacion
      }
    })

    return sales;
  }

  async create(body: any): Promise<void> {

    const { id_usuario_registro, productos, id_tipo_pago, tipo_descuento, monto_descuento } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log(body)
    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      body.fecha_hora_registro = fechaHoraRegistro;
      const saveResponse = await this.saleDao.save(body, queryRunner);
      if (saveResponse.errors) throw Error(saveResponse.errors);
      console.log(saveResponse);
      const idVenta = saveResponse.data.id_venta;

      const saveDetailResponse = await this.saleDao.saveDetail({
        id_usuario_registro,
        id_venta: idVenta,
        productos: JSON.stringify(productos),
        fecha_hora_registro: fechaHoraRegistro
      }, queryRunner);
      if (saveDetailResponse.errors) throw Error(saveDetailResponse.errors);
      console.log(saveDetailResponse);

      const saleDetails = await this.saleDao.getDetailById(idVenta, queryRunner);
      console.log(saleDetails);

      let total = saleDetails.reduce((sum, item) => this.math.add(this.math.bignumber(sum), this.math.bignumber(item.sub_total)), 0);
      let totalSugerido = saleDetails.reduce((sum, item) => this.math.add(this.math.bignumber(sum), this.math.bignumber(item.sub_total_sugerido)), 0);
      total = Number(total);
      totalSugerido = Number(totalSugerido);

      // let totalConDescuento = total;
      let descuento = 0;
      let tieneDescuento = false;
      let idTipoDescuento = 0;

      switch (tipo_descuento) {
        case Objects.TiposDescuento.FIXED.name:
          descuento = monto_descuento;
          totalSugerido = Math.max(0, totalSugerido - descuento);
          tieneDescuento = true;
          idTipoDescuento = Objects.TiposDescuento.FIXED.id;
          break;

        case Objects.TiposDescuento.PERCENT.name:
          descuento = (monto_descuento / 100) * total;
          totalSugerido = Math.max(0, totalSugerido - descuento);
          tieneDescuento = true;
          idTipoDescuento = Objects.TiposDescuento.PERCENT.id;
          break;
        default:
          break;
      }

      console.log({
        id_usuario_registro,
        id_venta: idVenta,
        total: total,
        totalSugerido,
        tieneDescuento,
        idTipoDescuento,
        descuento,
        valorDescuento: monto_descuento
      })

      const updateTotalResponse = await this.saleDao.updateTotal({
        id_usuario_registro,
        id_venta: idVenta,
        total: total,
        total_sugerido: totalSugerido,
        tiene_descuento: tieneDescuento,
        id_tipo_descuento: idTipoDescuento,
        descuento,
        valor_descuento: monto_descuento,
        fecha_hora_actualizacion: fechaHoraRegistro
      }, queryRunner);
      if (updateTotalResponse.errors) throw Error(updateTotalResponse.errors);
      console.log(updateTotalResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  async getDetailsById(idSale: number): Promise<any> {
    // console.log(idSale)
    try {
      let saleDetails = await this.saleDao.getDetailById(idSale);
      console.log(saleDetails)
      saleDetails = saleDetails.map(x => {
        return {
          id_venta_detalle: x.id_venta_detalle,
          id_venta: x.id_venta,
          id_producto: x.id_producto,
          producto: { id_producto: x.id_producto, codigo_producto: x.codigo_producto, nombre_producto: x.nombre_producto, precio_venta: x.precio_sugerido },
          precio: x.precio,
          cantidad: x.cantidad,
          id_talla: x.id_talla,
          talla: { id_talla: x.id_talla, nombre_talla: x.nombre_talla, codigo_talla: x.codigo_talla },
          id_color: x.id_color,
          color: { id_color: x.id_color, nombre_color: x.nombre_color, codigo_color: x.codigo_color },
          sub_total_sugerido: x.sub_total_sugerido,
          sub_total: x.sub_total
        }
      })

      return saleDetails;
    } catch (error) {
      return []
    }

  }

  async updateActive(body: any): Promise<void> {

    const { id_usuario_registro, es_activo, id_venta } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log(body)
    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const updateActiveResponse = await this.saleDao.updateActive({
        id_usuario_registro,
        id_venta: id_venta,
        es_activo: es_activo,
        fecha_hora_actualizacion: fechaHoraRegistro
      }, queryRunner);

      if (updateActiveResponse.errors) throw Error(updateActiveResponse.errors);
      console.log(updateActiveResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  async getByFilterWithPagination({ pagination, filter }: FilterSalesWithPaginationDto): Promise<any> {
    pagination.per_page = pagination.per_page > 0 ? pagination.per_page : 10;
    pagination.new_page = pagination.new_page > 0 ? pagination.new_page : 1;
    pagination.start = (pagination.new_page - 1) * pagination.per_page;

    const queryParams = this.saleDao.getFiltersSale(filter);
    console.log(queryParams)

    let sales = await this.saleDao.getByFilterWithPagination(queryParams, pagination);
    sales = sales.map(x => {
      return {
        id_venta: x.id_venta,
        concepto: x.concepto,
        id_tipo_pago: x.id_tipo_pago,
        tipo_pago: { nombre_tipo_pago: x.tipo_pago, id_tipo_pago: x.id_tipo_pago },
        tiene_descuento: x.tiene_descuento,
        id_tipo_descuento: x.id_tipo_descuento,
        tipo_descuento: x.tiene_descuento ? { nombre_tipo_descuento: x.tipo_descuento, id_tipo_descuento: x.id_tipo_descuento } : null,
        descuento: x.descuento,
        total_sugerido: x.total_sugerido,
        total: x.total,
        total_final: x.total_final,
        id_usuario_registro: x.id_usuario_registro,
        usuario_registro: {
          id_usuario: x.id_usuario_registro,
          nombre: x.usuario_registro_nombre,
          apellido_paterno: x.usuario_registro_apellido_paterno,
          apellido_materno: x.usuario_registro_apellido_materno
        },
        id_usuario_actualizacion: x.id_usuario_actualizacion,
        usuario_actualizacion: x.id_usuario_actualizacion ? {
          id_usuario: x.id_usuario_actualizacion,
          nombre: x.usuario_actualizacion_nombre,
          apellido_paterno: x.usuario_actualizacion_apellido_paterno,
          apellido_materno: x.usuario_actualizacion_apellido_materno
        } : null,
        fecha_registro: x.fecha_registro,
        hora_registro: x.hora_registro,
        fecha_actualizacion: x.fecha_actualizacion,
        hora_actualizacion: x.hora_actualizacion
      }
    })

    const paginationResponse = await this.paginationService.getPaginationWithFilters({
      query: `select 
          count(v.id_venta) total
      from ventas v
      ${queryParams.query}`, params: queryParams.params
    }, pagination);

    return {
      ventas: sales,
      paginacion: paginationResponse
    };
  }
}
