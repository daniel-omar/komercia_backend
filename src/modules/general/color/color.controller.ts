import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ColorService } from './services/color.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';

@Controller('general/color')
export class ColorController {
  constructor(private readonly colorService: ColorService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {
    let response = await this.colorService.getAll();
    return response;
  }

  @Get("/get_by_product")
  async getByProduct(@Request() req: Request, @Query() query: { id_producto: number }): Promise<ResponseDto> {
    let response = await this.colorService.getByProduct(query.id_producto);
    return response;
  }

  @Get("/get_product_color_by_filter")
  async getProductColorByFilter(@Request() req: Request, @Query() query: { id_producto: number, id_talla: number }): Promise<ResponseDto> {
    let response = await this.colorService.getProductColorByFilter(query);
    return response;
  }
}
