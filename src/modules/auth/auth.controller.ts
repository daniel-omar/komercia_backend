import { Authorization } from '@core/decorators/authorization.decorator';
import { Body, Controller, Post, Request } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';

import { AuthService } from './services/auth.service';

import { ResponseDto } from '@common/interfaces/response.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Authorization(false)
    @Post("/login")
    async login(@Request() req: Request, @Body() loginDto: LoginDto): Promise<ResponseDto> {
        const resp = await this.authService.login(loginDto)
        return {
            status: Number(process.env.STATUS_SERVICES_OK),
            data: resp,
            message: "success"
        };
    }

}
