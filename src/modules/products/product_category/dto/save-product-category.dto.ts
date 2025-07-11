import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Length, MinLength, Validate } from "class-validator";

export class SaveProductCategoryDto {
    @IsOptional()
    @IsNumber()
    id_categoria_producto: number;

    @IsOptional()
    @IsString()
    nombre_categoria: string;

    @IsOptional()
    @IsString()
    descripcion_categoria: string;

    @IsOptional()
    @IsBoolean()
    es_activo: boolean;

    @IsOptional()
    @IsNumber()
    id_usuario_registro?: number;
}


