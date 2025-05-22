import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "@common/interfaces/jwt-payload.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthJwtService {

    constructor(
        private jwtService: JwtService
    ) { }

    getJwtToken(payload: JwtPayload) {
        console.log(this.jwtService)
        const token = this.jwtService.sign(payload);
        return token;
    }

    getRefreshToken(payload: JwtPayload) {
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_REFRESH_SECRET, // usar otro secreto para seguridad
        });

        return refreshToken;
    }

    async verifyRefreshToken(body) {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(body.refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
        });
        return payload;
    }

}