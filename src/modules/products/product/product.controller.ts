import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, NotFoundException, Put, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ProductService } from './services/product.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';
import { FilterProductDto } from './dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { User } from '@modules/auth/entities/user.entity';
import { SaveProductDto } from './dto/save-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from '@common/services/excel.service';
import { TagProductsDto, TagProductsVariantDto } from './dto/tag-products.dto';
import { Response } from 'express'; // 👈 Importa de express
import { SaveVariantDto } from './dto/save-variant.dto';
import { SaveVariantsDto } from './dto/save-variants.dto';
import { FilterProductVariantDto } from './dto/filter-product_variant.dto';
import { SaveInventoryDto } from './dto/save-inventory.dto';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Objects } from '@common/constants/objects';

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

  @Get("/get_variants_group/:id_producto")
  async getVariantsGroup(@Param('id_producto') id_producto): Promise<ResponseDto> {
    let response = await this.productService.getProductVariantsGroup(id_producto);
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

  @Put("/update_active")
  async updateActive(@Request() req: Request, @Body() body): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.productService.updateActive(body);
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

  @Post("/save_variants")
  async saveVariants(@Request() req: Request, @Body() body: SaveVariantsDto): Promise<any> {
    const user: User = req["user"];
    body.id_usuario_registro = user.id_usuario;
    await this.productService.saveVariants(body);
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

    const responseValidation = await this.productService.validSaveBulk(worksheet);
    console.log(responseValidation);
    if (responseValidation.length <= 0) throw Error("No has ingresado registros.");
    const responseSave = await this.productService.saveBulk(responseValidation, user.id_usuario);

    return responseSave;
  }

  @Post("/save_income_bulk")
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1
      },
    }),
  )
  async saveIncomeBulk(@UploadedFile() file: Express.Multer.File, @Request() req: Request): Promise<any> {
    const user: User = req["user"];

    const excelWorkbook = await this.excelService.loadFromBuffer(file.buffer);
    let worksheet = excelWorkbook.getWorksheet(1);

    const responseValidation = await this.productService.validSaveIncomeBulk(worksheet);
    if (responseValidation.ingresos.length <= 0) throw Error("No has ingresado registros.");
    const responseSave = await this.productService.saveIncomeBulk(responseValidation.ingresos, responseValidation.id_tipo_ingreso, user.id_usuario);

    return responseSave;
  }

  @Post("/save_income")
  async saveIncome(@Request() req: Request, @Body() saveInventory: SaveInventoryDto): Promise<any> {
    const user: User = req["user"];

    await this.productService.saveIncome(saveInventory.productos_variantes, Objects.TiposIngreso.COMPRA.id, user.id_usuario);
    return true;
  }

  // @Post("/generate_tags")
  // async generateTags(@Res() res: Response, @Request() req: Request, @Body() products: TagProductsDto): Promise<any> {
  //   const user: User = req["user"];

  //   const { ids_producto } = products;
  //   const bytes = await this.productService.generateTags(ids_producto, "");

  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.send(bytes);
  // }

  @Post("/generate_tags_variantes")
  async generateTags(@Res() res: Response, @Request() req: Request, @Body() productsVariants: TagProductsVariantDto): Promise<any> {
    const user: User = req["user"];

    const { productos_variantes } = productsVariants;

    const bytes = await this.productService.generateTagsV2(productos_variantes, "");
    await this.productService.saveIncome(productos_variantes, Objects.TiposIngreso.COMPRA.id, user.id_usuario);

    res.setHeader('Content-Type', 'application/pdf');
    res.send(bytes);
  }

  @Get("/find_product_variant")
  async findProductVariant(@Query() query: FilterProductVariantDto): Promise<ResponseDto> {
    // throw new NotFoundException("gaa")
    let response = await this.productService.findProductVariant(query);
    if (!response) throw new NotFoundException("No encontrado");

    return response;
  }

  @Get('/download_template_products')
  async downloadTemplate(@Res() res: Response) {
    console.log("res")
    const filePath = './src/templates/plantilla_carga_producto.xlsx';
    const fileName = 'plantilla_productos.xlsx';

    if (!existsSync(filePath)) {
      console.error("❌ Archivo no encontrado:", filePath);
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Post("/save_output")
  async saveOutput(@Request() req: Request, @Body() saveInventory: SaveInventoryDto): Promise<any> {
    const user: User = req["user"];

    await this.productService.saveOutput(saveInventory.productos_variantes, user.id_usuario);
    return true;
  }

}
