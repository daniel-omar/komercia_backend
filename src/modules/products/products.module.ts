import { Module } from '@nestjs/common';
import { ProductCategoryModule } from './product_category/product_category.module';
import { ProductModule } from './product/product.module';

@Module({
    imports: [
        ProductModule,
        ProductCategoryModule
    ]
})
export class ProductsModule { }
