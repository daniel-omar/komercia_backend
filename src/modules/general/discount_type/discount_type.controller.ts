import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DiscountTypeService } from './services/discount_type.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';

@Controller('general/discount_type')
export class DiscountTypeController {
  constructor(private readonly discountTypeService: DiscountTypeService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {
    let response = await this.discountTypeService.getAll();
    return response;
  }

}
