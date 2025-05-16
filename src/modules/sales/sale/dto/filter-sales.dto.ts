import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class FiltersSalesDto {

    @IsOptional()
    @IsString()
    fecha_inicio: string;

    @IsOptional()
    @IsString()
    fecha_fin: string;

    @IsOptional()
    @IsNumber()
    id_venta: number;

}
