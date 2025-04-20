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
}