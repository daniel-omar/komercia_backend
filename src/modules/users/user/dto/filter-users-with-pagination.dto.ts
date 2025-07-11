import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { FilterUsersDto } from "./filter-users.dto";
import { PaginationDto } from "./pagination.dto";

export class FilterUsersWithPaginationDto {

    @ValidateNested()
    @Type(() => FilterUsersDto)
    filter: FilterUsersDto;

    @ValidateNested()
    @Type(() => PaginationDto)
    pagination: PaginationDto;
}   
