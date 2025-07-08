import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { FilterProductsDto } from "./filter-products.dto";
import { PaginationDto } from "./pagination.dto";

export class FilterProductsWithPaginationDto {

    @ValidateNested()
    @Type(() => FilterProductsDto)
    filter: FilterProductsDto;

    @ValidateNested()
    @Type(() => PaginationDto)
    pagination: PaginationDto;
}   
