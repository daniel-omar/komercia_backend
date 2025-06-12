import { IsNumber, IsOptional } from "class-validator";

export class SaveVariantDto {

    @IsNumber()
    id_producto: number;

    @IsNumber()
    id_talla: number;

    @IsNumber()
    id_color: number;

    @IsOptional()
    @IsNumber()
    cantidad: number;
}


