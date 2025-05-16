import { Module } from '@nestjs/common';
import { SaleService } from './services/sale.service';
import { SaleDao } from './dao/sale.dao';
import { SaleController } from './sale.controller';

@Module({
  controllers: [SaleController],
  providers: [
    SaleService,
    SaleDao],
  imports: []
})
export class SaleModule { }
