import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class ExceptionsLoggerFilter extends BaseExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {
    console.log(exception);
    if (exception["response"] && !exception["response"].status) {
      exception["response"].status = Number(process.env.STATUS_SERVICES_ERROR)
    }
    super.catch(exception, host);
  }

}