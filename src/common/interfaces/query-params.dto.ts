import { ApiProperty } from '@nestjs/swagger';

export class QueryParamsDto {
    query: string;
    conditions: any[];
    params: any[];
}
