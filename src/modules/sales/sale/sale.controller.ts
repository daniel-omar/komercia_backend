import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, NotFoundException, Put } from '@nestjs/common';
import { SaleService } from './services/sale.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';
import { FilterSaleDto, FiltersSalesDto } from './dto';
import { User } from '@modules/auth/entities/user.entity';

@Controller('sales/sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<any> {

    let response = await this.saleService.getAll();
    return response;
  }

  @Get("/find")
  async find(@Query() query: FilterSaleDto): Promise<any> {
    // throw new NotFoundException("gaa")
    let response = await this.saleService.find(query);
    if (!response) throw new NotFoundException("No encontrado");

    return response;
  }

  @Get("/get_by_filter")
  async getByFilter(@Query() query: FiltersSalesDto): Promise<any> {
    // throw new NotFoundException("gaa")
    let response = await this.saleService.getByFilter(query);
    return response;
  }

  @Post("/create")
  async create(@Request() req: Request, @Body() body): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.saleService.create(body);

    return true;
  }

  @Get("/get_details/:id_venta")
  async getDetails(@Param('id_venta') id_venta): Promise<any> {
    // throw new NotFoundException("gaa")
    let response = await this.saleService.getDetailsById(id_venta);
    return response;
  }

  @Put("/update_active")
  async updateActive(@Request() req: Request, @Body() body): Promise<any> {
    const user: User = req["user"];
    body = {
      ...body,
      id_usuario_registro: user.id_usuario
    }
    await this.saleService.updateActive(body);
    return true;
  }

}
