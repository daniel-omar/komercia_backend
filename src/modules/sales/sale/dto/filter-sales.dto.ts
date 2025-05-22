import { Transform, Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class FiltersSalesDto {

    @IsOptional()
    @IsString()
    fecha_inicio: string;

    @IsOptional()
    @IsString()
    fecha_fin: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map((val) => parseInt(val, 10));
        }
        return typeof value === 'string'
            ? value.split(',').map((val) => parseInt(val, 10))
            : [];
    })
    @IsArray()
    @IsInt({ each: true })
    ids_tipo_pago: number[];

    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map((val) => parseInt(val, 10));
        }
        return typeof value === 'string'
            ? value.split(',').map((val) => parseInt(val, 10))
            : [];
    })
    @IsArray()
    @IsInt({ each: true })
    ids_usuario_registro: number[];

    @IsOptional()
    @IsNumber()
    id_venta: number;

}
