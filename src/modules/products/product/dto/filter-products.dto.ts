import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class FilterProductsDto {

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_categoria: number;

    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map((val) => parseInt(val, 10));
        }
        return typeof value === 'string'
            ? value.split(',').map((val) => parseInt(val, 10))
            : [];
    })
    @IsArray()
    @IsInt({ each: true })
    ids_categoria: number[];

    @IsOptional()
    // @IsBoolean()
    es_activo: boolean;
}   
