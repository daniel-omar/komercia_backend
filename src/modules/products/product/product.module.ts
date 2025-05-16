import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductDao } from './dao/product.dao';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductDao],
  imports: []
})
export class ProductModule { }
