import { Module } from '@nestjs/common';
import { SaleService } from './services/sale.service';
import { SaleDao } from './dao/sale.dao';
import { SaleController } from './sale.controller';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  controllers: [SaleController],
  providers: [
    SaleService,
    SaleDao,

    PaginationService
  ],
  imports: []
})
export class SaleModule { }
