import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PeriodService } from './services/period.service';

import { ResponseDto } from 'src/common/interfaces/response.dto';

@Controller('general/period')
export class PeriodController {
  constructor(private readonly periodService: PeriodService) { }

  @Get("/get_all")
  async getAll(@Request() req: Request): Promise<ResponseDto> {
    let response = await this.periodService.getAll();
    return response;
  }

  @Get("/get_to_filters")
  async getByProduct(@Request() req: Request): Promise<ResponseDto> {
    let response = await this.periodService.getToFilters();
    return response;
  }
}
