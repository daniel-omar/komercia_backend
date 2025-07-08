import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsNumber()
    new_page: number;

    @IsNumber()
    current_page: number;

    @IsNumber()
    per_page: number;

    @IsOptional()
    @IsNumber()
    start: number;
}   
