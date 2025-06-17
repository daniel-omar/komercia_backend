import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, MinLength, Validate } from "class-validator";

export class FilterProductVariantDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_producto_variante: string;

    @IsOptional()
    @IsString()
    codigo_producto_variante: string;

    @IsOptional()
    @IsString()
    es_activo: boolean;

    @IsOptional()
    @IsString()
    tiene_cantidad: boolean;

    @AtLeastOneField(['id_producto_variante', 'codigo_producto_variante'])
    _atLeastOneFieldValidator: any;
}


