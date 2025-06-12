import { AtLeastOneField } from "@common/validators/least-one-field-constraint.validator";
import { Type } from "class-transformer";
import { IsArray, IsEmail, IsNumber, IsOptional, IsString, Length, MinLength, Validate } from "class-validator";
import { SaveVariantDto } from "./save-variant.dto";

export class SaveVariantsDto {
    @IsArray()
    variantes: SaveVariantDto[];

    @IsOptional()
    id_usuario_registro?: number;
}


