import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductCategoryService } from './services/product_category.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';

@Controller('products/product_category')
export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {

    let response = await this.productCategoryService.getAll();
    return response;
  }

}
