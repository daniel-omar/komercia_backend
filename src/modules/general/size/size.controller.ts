import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SizeService } from './services/size.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';

@Controller('general/size')
export class SizeController {
  constructor(private readonly sizeService: SizeService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {
    let response = await this.sizeService.getAll();
    return response;
  }

  @Get("/get_by_product")
  async getByProduct(@Request() req: Request, @Query() query: { id_producto: number }): Promise<ResponseDto> {
    let response = await this.sizeService.getByProduct(query.id_producto);
    return response;
  }
}
