import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, NotFoundException, Put } from '@nestjs/common';
import { ProductService } from './services/product.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';
import { FilterProductDto } from './dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { User } from '@modules/auth/entities/user.entity';

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

  @Get("/get_by_filter")
  async getByFilter(@Query() query: FilterProductsDto): Promise<ResponseDto> {
    let response = await this.productService.getByFilter(query);
    return response;
  }

  @Get("/get_variants/:id_producto")
  async getVariants(@Param('id_producto') id_producto): Promise<ResponseDto> {
    let response = await this.productService.getProductVariants(id_producto);
    return response;
  }

  @Put("/update")
  async update(@Request() req: Request, @Body() body): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.productService.update(body);
    return true;
  }
}
