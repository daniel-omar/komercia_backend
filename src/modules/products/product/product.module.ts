import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductDao } from './dao/product.dao';
import { ProductController } from './product.controller';
import { ExcelService } from '@common/services/excel.service';
import { CargaDAO } from '@common/services/dao/carga.dao';
import { FormatoCargaDAO } from '@common/services/dao/formato-carga.dao';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductDao,
    ExcelService,
    CargaDAO,
    FormatoCargaDAO
  ],
  imports: []
})
export class ProductModule { }
