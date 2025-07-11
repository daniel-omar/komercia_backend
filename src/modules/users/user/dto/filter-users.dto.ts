import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class FilterUsersDto {

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
    ids_perfil: number[];

    @IsOptional()
    numero_documento: String;

    @IsOptional()
    nombre: String;

    @IsOptional()
    apellido_paterno: String;

    @IsOptional()
    apellido_materno: String;

    @IsOptional()
    es_activo: boolean;
}   
