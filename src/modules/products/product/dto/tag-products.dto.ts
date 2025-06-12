import { Transform, Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class TagProductsDto {
    @IsArray()
    @IsInt({ each: true })
    ids_producto: number[];
}

export class TagProductsVariantDto {
    @IsArray()
    productos_variantes: TagProductVariantDto[];
}

export class TagProductVariantDto {
    @IsNumber()
    id_producto_variante: number;
    @IsNumber()
    cantidad: number;
} 