import { Module } from '@nestjs/common';
import { ProductCategoryService } from './services/product_category.service';
import { ProductCategoryDao } from './dao/product_category.dao';
import { ProductCategoryController } from './product_category.controller';

@Module({
  controllers: [ProductCategoryController],
  providers: [
    ProductCategoryService,
    ProductCategoryDao],
  imports: []
})
export class ProductCategoryModule { }
