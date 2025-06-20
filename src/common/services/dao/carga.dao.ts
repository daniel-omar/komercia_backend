import { Injectable } from '@nestjs/common';
import { Console } from 'console';
import { Connection, QueryRunner, DataSource } from 'typeorm';

@Injectable()
export class CargaDAO {

    constructor(private connection: DataSource) { }

    public async saveCarga(id_formato: number, id_usuario: number, fecha_hora_registro: any) {
        try {
            const carga = await this.connection.query(
                `select func_guardar_carga id_carga
                from STAGE.func_guardar_carga($1,$2,$3)
            `,
                [id_formato, id_usuario, fecha_hora_registro],
            );

            return { id_carga: carga[0]?.id_carga };
        } catch (error) {
            throw new Error(error);
        }
    }

    public async updateCarga(id_carga: number, total_filas: number, total_filas_incorrectas: number, observacion: string) {
        try {
            const result = await this.connection.query(
                `select
                    func_actualizar_carga result
                from STAGE.func_actualizar_carga($1,$2,$3,$4)
            `,
                [
                    id_carga,
                    total_filas,
                    total_filas_incorrectas,
                    observacion
                ]
            );

            return result;
        } catch (error) {
            throw new Error(error);
        }
    }

    public async getDetailsCarga(id_carga: number, nombre_tabla: string) {
        try {
            const result = await this.connection.query(
                `select
                    *
                from ${nombre_tabla}
                where
                id_carga=$1
                order by 1 asc
            `,
                [
                    id_carga
                ]
            );

            return result;
        } catch (error) {
            throw new Error(error);
        }
    }
}