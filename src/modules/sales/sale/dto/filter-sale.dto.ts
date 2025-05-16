import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, MinLength, Validate } from "class-validator";

export class FilterSaleDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_tipo_pago: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_venta: string;

    @AtLeastOneField(['id_tipo_pago', 'id_venta'])
    _atLeastOneFieldValidator: any;
}


