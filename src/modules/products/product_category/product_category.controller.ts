import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put, NotFoundException } from '@nestjs/common';
import { ProductCategoryService } from './services/product_category.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';
import { User } from '@modules/auth/entities/user.entity';
import { SaveProductCategoryDto } from './dto/save-product-category.dto';

@Controller('products/product_category')
export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {

    let response = await this.productCategoryService.getAll();
    return response;
  }

  @Get("/get_all_v2")
  async getAllV2(@Request() req: Request): Promise<ResponseDto> {

    let response = await this.productCategoryService.getAllV2();
    return response;
  }

  @Get("/get_by_id/:id_categoria")
  async find(@Param('id_categoria') id_categoria): Promise<ResponseDto> {
    // throw new NotFoundException("gaa")
    let response = await this.productCategoryService.findById(id_categoria);
    if (!response) throw new NotFoundException("No encontrado");

    return response;
  }

  @Put("/update_active")
  async updateActive(@Request() req: Request, @Body() body): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.productCategoryService.updateActive(body);
    return true;
  }

  @Post("/create")
  async save(@Request() req: Request, @Body() body: SaveProductCategoryDto): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.productCategoryService.create(body);
    return true;
  }

  @Put("/update")
  async update(@Request() req: Request, @Body() body: SaveProductCategoryDto): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.productCategoryService.update(body);
    return true;
  }

}
