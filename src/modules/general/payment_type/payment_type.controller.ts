import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PaymentTypeService } from './services/payment_type.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';

@Controller('general/payment_type')
export class PaymentTypeController {
  constructor(private readonly paymentTypeService: PaymentTypeService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {
    let response = await this.paymentTypeService.getAll();
    return response;
  }

}
