import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, Length, MinLength, Validate } from "class-validator";

export class SaveProductDto {
    @IsString()
    @Length(3)
    nombre_producto: string;

    @IsOptional()
    @IsString()
    descripcion_producto: string;

    @IsNumber()
    precio_compra: number;

    @IsNumber()
    precio_venta: number;

    @IsNumber()
    id_categoria_producto: number;

    @IsOptional()
    @IsString()
    categoria_producto: string;

    @IsOptional()
    @IsNumber()
    id_usuario_registro?: number;
}


