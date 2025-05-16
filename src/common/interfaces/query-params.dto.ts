import { ApiProperty } from '@nestjs/swagger';

export class QueryParamsDto {
    query: string;
    params: any[];
}
