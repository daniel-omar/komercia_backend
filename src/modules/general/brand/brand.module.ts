import { Module } from '@nestjs/common';
import { BrandService } from './services/brand.service';
import { BrandDao } from './dao/brand.dao';
import { BrandController } from './brand.controller';

@Module({
  controllers: [BrandController],
  providers: [
    BrandService,
    BrandDao],
  imports: []
})
export class BrandModule { }
