import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsArray, IsEmail, IsNumber, IsOptional, IsString, Length, MinLength, Validate } from "class-validator";

// export class SaveInventoryDto {
//     @IsOptional()
//     @IsNumber()
//     id_producto?: number;

//     @IsString()
//     @Length(3)
//     codigo_producto: string;

//     @IsNumber()
//     id_talla?: number;

//     @IsString()
//     talla: string;

//     @IsNumber()
//     id_color?: number;

//     @IsString()
//     color: string;

//     @IsNumber()
//     cantidad: number;
// }

export class SaveInventoryDto {
    @IsArray()
    productos_variantes: ProductVariantDto[];
}

export class ProductVariantDto {
    @IsOptional()
    @IsNumber()
    id_producto_variante?: number;

    @IsOptional()
    @IsString()
    codigo_producto_variante?: string;

    @IsNumber()
    cantidad: number;
}

