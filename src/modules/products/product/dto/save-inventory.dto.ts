import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, Length, MinLength, Validate } from "class-validator";

export class SaveInventoryDto {
    @IsOptional()
    @IsNumber()
    id_producto?: number;

    @IsString()
    @Length(3)
    codigo_producto: string;

    @IsNumber()
    id_talla?: number;

    @IsString()
    talla: string;

    @IsNumber()
    id_color?: number;

    @IsString()
    color: string;

    @IsNumber()
    cantidad: number;
}


