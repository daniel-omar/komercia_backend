import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
    message: string;
    data: object;
    errors?: { [key: string]: any };
    status: number;
}
