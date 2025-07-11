import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsNumber()
    id_usuario: number;

    @IsString()
    nombre: string;

    @IsString()
    apellido_paterno: string;

    @IsString()
    apellido_materno: string;

    @IsNumber()
    id_tipo_documento: number;

    @IsString()
    numero_documento: string;

    @IsString()
    numero_telefono: string;

    @IsNumber()
    id_perfil: number;

    @IsEmail()
    correo: string;

    @IsOptional()
    @IsNumber()
    id_usuario_registro?: number;
}
