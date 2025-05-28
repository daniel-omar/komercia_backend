import { Injectable } from '@nestjs/common';
import { Console } from 'console';
import { Connection, QueryRunner, DataSource } from 'typeorm';

@Injectable()
export class FormatoCargaDAO {

    constructor(private connection: DataSource) { }

    public async getFormatoCargaByNombre(nombre_formato: string) {
        try {
            const formato_carga = await this.connection.query(
                `select
                    id_formato_carga,
                    nombre_query_carga
                from stage.formato_carga
                where
                nombre_formato_carga=$1
                limit 1
            `,
                [nombre_formato],
            );

            return formato_carga[0];
        } catch (error) {
            throw new Error(error);
        }
    }

    public async getFormatoCargaByIdFormato(id_formato: number) {
        try {
            const formato_carga = await this.connection.query(
                `select
                    id_formato_carga,
                    nombre_query_carga,
                    nombre_tabla_carga
                from stage.formato_carga
                where
                id_formato_carga=$1
                limit 1
            `,
                [id_formato],
            );

            return formato_carga[0];
        } catch (error) {
            throw new Error(error);
        }
    }

    public async getFormatoDetalleCargaByIdFormato(id_formato: number) {
        try {
            const formato_detalle_carga = await this.connection.query(
                `select 
                    nombre_columna,
                    alias_nombre_columna,
                    es_obligatorio
                from stage.formato_detalle_carga
                where
                id_formato_carga=$1
            `,
                [id_formato],
            );

            return formato_detalle_carga;
        } catch (error) {
            throw new Error(error);
        }
    }

}