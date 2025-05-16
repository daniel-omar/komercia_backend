import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, MinLength, Validate } from "class-validator";

export class FilterProductDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_producto: string;

    @IsOptional()
    @IsString()
    codigo_producto: string;

    @AtLeastOneField(['id_producto', 'codigo_producto'])
    _atLeastOneFieldValidator: any;
}


