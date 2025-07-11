import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';

import { AuthGuard } from '@common/guards/auth.guard';
import { ResponseDto } from 'src/common/interfaces/response.dto';
import { Authorization } from '@core/decorators/authorization.decorator';
import { DocumentTypeService } from './services/document_type.service';

@Controller('users/document_type')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) { }

  @Get("/get_all")
  async getAll(): Promise<any> {
    // throw new NotFoundException("gaa")
    let response = await this.documentTypeService.getAll();
    return response;
  }

}
