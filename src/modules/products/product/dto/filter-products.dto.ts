import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class FilterProductsDto {

    @IsNumber()
    @Type(() => Number)
    id_producto: string;

    @IsString()
    codigo_producto: string;
}
