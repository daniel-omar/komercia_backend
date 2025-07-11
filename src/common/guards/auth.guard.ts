import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import * as request from 'supertest';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@modules/auth/services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService, private authService: AuthService, private readonly reflector: Reflector) { }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {

    const is_authorizated = this.reflector.get<boolean>("authorizated", context.getHandler()) ?? true;
    // console.log(is_authorizated)
    if (!is_authorizated) {
      return true;
    }

    //console.log(context)
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    //console.log(token)
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.JWT_SECRET
        }
      );
      //console.log(payload)
      const user = await this.authService.findById(payload.id_usuario);
      if (!user) throw new UnauthorizedException("User does not exists");
      if (!user.es_activo) throw new UnauthorizedException("User is not active");

      request['user'] = user;
      request['token'] = token;
    } catch {
      throw new UnauthorizedException();
    }

    return Promise.resolve(true);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    //console.log(request)
    const [type, token] = request.headers["authorization"]?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
