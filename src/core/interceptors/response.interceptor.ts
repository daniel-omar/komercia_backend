import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {

                const ctx = context.switchToHttp();
                const response = ctx.getResponse();

                return {
                    statusCode: response.statusCode || 200,
                    status: Number(process.env.STATUS_SERVICES_OK),
                    message: 'Operación exitosa',
                    data,
                };
            }),
        );
    }
}