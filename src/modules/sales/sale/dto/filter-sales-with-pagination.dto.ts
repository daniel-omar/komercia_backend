import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { PaginationDto } from "./pagination.dto";
import { FiltersSalesDto } from "./filter-sales.dto";

export class FilterSalesWithPaginationDto {

    @ValidateNested()
    @Type(() => FiltersSalesDto)
    filter: FiltersSalesDto;

    @ValidateNested()
    @Type(() => PaginationDto)
    pagination: PaginationDto;
}   
