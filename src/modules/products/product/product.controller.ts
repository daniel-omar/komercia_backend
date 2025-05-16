import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, NotFoundException } from '@nestjs/common';
import { ProductService } from './services/product.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';
import { FilterProductDto } from './dto';

@Controller('products/product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {

    let response = await this.productService.getAll();
    return response;
  }

  @Get("/find")
  async find(@Query() query: FilterProductDto): Promise<ResponseDto> {
    // throw new NotFoundException("gaa")
    let response = await this.productService.find(query);
    if (!response) throw new NotFoundException("No encontrado");

    return response;
  }
}
