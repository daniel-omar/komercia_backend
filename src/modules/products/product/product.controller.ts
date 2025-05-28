import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, NotFoundException, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductService } from './services/product.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';
import { FilterProductDto } from './dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { User } from '@modules/auth/entities/user.entity';
import { SaveProductDto } from './dto/save-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from '@common/services/excel.service';

@Controller('products/product')
export class ProductController {
  constructor(private readonly productService: ProductService, private readonly excelService: ExcelService) { }

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

  @Post("/save")
  async save(@Request() req: Request, @Body() body: SaveProductDto): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.productService.save(body);
    return true;
  }

  @Post("/save_bulk")
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1
      },
    }),
  )
  async saveBulk(@UploadedFile() file: Express.Multer.File, @Request() req: Request): Promise<any> {
    const user: User = req["user"];

    const excelWorkbook = await this.excelService.loadFromBuffer(file.buffer);
    let worksheet = excelWorkbook.getWorksheet(1);

    const saveProductos = await this.productService.validSaveBulk(worksheet);
    const responseSave = await this.productService.saveBulk(saveProductos, user.id_usuario);

    return responseSave;
  }

}
