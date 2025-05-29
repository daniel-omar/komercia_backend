import { Transform, Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class TagProductsDto {
    @IsArray()
    @IsInt({ each: true })
    ids_producto: number[];
}   
