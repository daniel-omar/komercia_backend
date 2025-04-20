import { IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    correo: string;

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

    @MinLength(6)
    clave: string;
}
