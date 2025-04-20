import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedResponseDto {
    @ApiProperty({ example: 'token_decode_error' })
    message: string;
    @ApiProperty({
        example: null,
    })
    data: object;
    @ApiProperty({ example: 'jwt expired / invalid token' })
    errors: { [key: string]: any };
}
