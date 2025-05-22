import { Objects } from '@common/constants/objects';
import { QueryParamsDto } from '@common/interfaces/query-params.dto';
import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class SaleDao {

  constructor(
    private connection: Connection

  ) { }

  async getAll(): Promise<any> {

    const sales = await this.connection.query(`select * from ventas`, []);

    return sales;

  }

  getFiltersSale(filters): QueryParamsDto {
    let result: QueryParamsDto;
    result = { query: '', params: [], conditions: [] };

    if (filters.id_venta != undefined) {
      result.conditions.push(`v.id_venta=$${(result.params.length + 1)}`);
      result.params.push(filters.id_venta);
    }
    if (filters.fecha != undefined) {
      result.conditions.push(`to_char(v.fecha_hora_registro,'YYYY-MM-DD') = $${(result.params.length + 1)}`);
      result.params.push(filters.fecha);
    }
    if (filters.fecha_inicio != undefined) {
      result.conditions.push(`v.fecha_hora_registro::date between $${(result.params.length + 1)} and $${(result.params.length + 2)}`);
      result.params.push(filters.fecha_inicio);
      result.params.push(filters.fecha_fin);
    }
    const { ADMINISTRADOR, SUPERVISOR, VENDEDOR } = Objects.Pefiles;
    if ([VENDEDOR.name, SUPERVISOR.name].includes(filters.usuario.perfil.nombre_perfil.toLowerCase())) {
      result.conditions.push(`v.id_usuario_registro=$${(result.params.length + 1)}`);
      result.params.push(filters.usuario.id_usuario);
    }
    if (filters.ids_tipo_pago != undefined && filters.ids_tipo_pago.length > 0) {
      result.conditions.push(`v.id_tipo_pago=any($${(result.params.length + 1)}::integer[])`);
      result.params.push(filters.ids_tipo_pago);
    }
    if (filters.ids_usuario_registro != undefined && filters.ids_usuario_registro.length > 0) {
      result.conditions.push(`(v.id_usuario_registro=any($${(result.params.length + 1)}::integer[]) or v.id_usuario_actualizacion=any($${(result.params.length + 1)}::integer[]))`);
      result.params.push(filters.ids_usuario_registro);
    }

    result.conditions.push(`v.es_activo = $${(result.params.length + 1)}`);
    result.params.push(true);

    result.query = result.conditions.join(' AND ');
    result.query = `where ${result.query}`;

    return result;
  }

  async find({ query, params }: QueryParamsDto) {

    const sales = await this.connection.query(`select * from ventas v ${query} limit 1;`, params);
    return sales[0];

  }

  async getByFilter({ query, params }: QueryParamsDto) {

    const sales = await this.connection.query(`
      select 
          v.id_venta,
          v.concepto,
          v.id_tipo_pago,
          tp.nombre_tipo_pago tipo_pago,
          v.tiene_descuento,
          v.id_tipo_descuento,
          td.nombre_tipo_descuento tipo_descuento,
          v.descuento,
          v.total_sugerido,
          v.total,
          v.total_final,
          v.id_usuario_registro,
          ur.nombre usuario_registro_nombre,
          ur.apellido_paterno usuario_registro_apellido_paterno,
          ur.apellido_materno usuario_registro_apellido_materno,
          v.id_usuario_actualizacion,
          ua.nombre usuario_actualizacion_nombre,
          ua.apellido_paterno usuario_actualizacion_apellido_paterno,
          ua.apellido_materno usuario_actualizacion_apellido_materno,
          to_char(v.fecha_hora_registro,'YYYY-MM-DD') fecha_registro,
          to_char(v.fecha_hora_registro,'HH12:MI AM') hora_registro,
          to_char(v.fecha_hora_actualizacion,'YYYY-MM-DD') fecha_actualizacion,
          to_char(v.fecha_hora_actualizacion,'HH12:MI AM') hora_actualizacion
      from ventas v
      inner join tipos_pago tp on tp.id_tipo_pago=v.id_tipo_pago
      left join tipos_descuento td on td.id_tipo_descuento=v.id_tipo_descuento
      inner join usuarios ur on ur.id_usuario=v.id_usuario_registro
      inner join usuarios ua on ua.id_usuario=v.id_usuario_actualizacion
      ${query}
      order by v.fecha_hora_registro desc;`, params);
    return sales;

  }

  async save(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {
      const response = await connection.query(`insert into ventas(id_tipo_pago,id_usuario_registro,concepto)
      values($1,$2,$3)
      returning id_venta;`, [body.id_tipo_pago, body.id_usuario_registro, body.concepto]);

      return {
        message: 'save success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('save.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async updateTotal(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_venta, id_usuario_registro, total, total_sugerido, tiene_descuento, id_tipo_descuento, descuento, valor_descuento } = body;
      const response = await connection.query(`update ventas
       set 
           id_usuario_actualizacion=$2,
           fecha_hora_actualizacion=CURRENT_TIMESTAMP,
           total=$3,
           total_sugerido=$4,
           tiene_descuento=$5,
           id_tipo_descuento=$6,
           descuento=$7,
           valor_descuento=$8
       where
       id_venta=$1
      returning id_venta;`, [id_venta, id_usuario_registro, total, total_sugerido, tiene_descuento, id_tipo_descuento, descuento, valor_descuento]);

      return {
        message: 'save success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('save.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async saveDetail(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {
      const response = await connection.query(`select * from func_guardar_venta_detalle($1,$2,$3)`, [body.id_venta, body.id_usuario_registro, body.productos]);

      return {
        message: 'saveDetail success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('saveDetail.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }

  async getDetailById(id_venta: number, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;

    const response = await connection.query(`
      select 
          vd.id_venta_detalle,
          vd.id_venta,
          vd.id_producto,
          p.codigo_producto,
          p.nombre_producto,
          vd.precio_sugerido precio_sugerido,
          vd.precio precio,
          vd.cantidad,
          vd.id_talla,
          t.nombre_talla,
          vd.id_color,
          c.nombre_color,
          vd.sub_total_sugerido,
          vd.sub_total
      from ventas v
      inner join ventas_detalles vd on vd.id_venta=v.id_venta
      inner join productos p on p.id_producto=vd.id_producto
      inner join tallas t on t.id_talla=vd.id_talla
      inner join colores c on c.id_color=vd.id_color
      where 
      v.id_venta=$1;`, [id_venta]);
    return response;
  }

  async updateActive(body, connection?: Connection | QueryRunner) {
    if (!connection) connection = this.connection;
    try {

      const { id_venta, id_usuario_registro, es_activo } = body;
      const response = await connection.query(`update ventas
       set 
           id_usuario_actualizacion=$2,
           fecha_hora_actualizacion=CURRENT_TIMESTAMP,
           es_activo=$3
       where
       id_venta=$1
      returning id_venta;`, [id_venta, id_usuario_registro, es_activo]);

      return {
        message: 'save success',
        data: response[0],
        errors: null,
      };

    } catch (error) {
      console.log('save.dao error: ', error.message);
      return {
        errors: error.message,
      };
    }
  }
}
