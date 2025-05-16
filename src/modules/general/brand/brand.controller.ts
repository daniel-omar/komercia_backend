import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BrandService } from './services/brand.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';

@Controller('general/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {
    let response = await this.brandService.getAll();
    return response;
  }

}
