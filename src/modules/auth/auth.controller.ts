import { Authorization } from '@core/decorators/authorization.decorator';
import { Body, Controller, Get, Param, Post, Request, UnauthorizedException } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';

import { AuthService } from './services/auth.service';

import { ResponseDto } from '@common/interfaces/response.dto';
import { User } from './entities/user.entity';

@Controller('auth')
// @Authorization(false)
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Authorization(false)
    @Post("/login")
    async login(@Request() req: Request, @Body() loginDto: LoginDto): Promise<any> {
        const resp = await this.authService.login(loginDto)
        return resp;
    }

    @Get("/get_permissions/:id_aplicacion")
    async getPermissions(@Request() req: Request, @Param('id_aplicacion') id_aplicacion): Promise<any> {
        const user: User = req["user"];
        const resp = await this.authService.getPermissions(user.id_perfil, id_aplicacion)
        return resp;
    }

    @Authorization(false)
    @Post('/refresh')
    async refresh(@Body() body: { refresh_token: string }): Promise<any> {
        try {
            const payload = this.authService.refresh(body.refresh_token);
            return payload;
        } catch (e) {
            throw new UnauthorizedException('Token expirado o inválido');
        }
    }

}
