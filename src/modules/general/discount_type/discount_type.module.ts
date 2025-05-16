import { Module } from '@nestjs/common';
import { DiscountTypeService } from './services/discount_type.service';
import { DiscountTypeDao } from './dao/discount_type.dao';
import { DiscountTypeController } from './discount_type.controller';

@Module({
  controllers: [DiscountTypeController],
  providers: [
    DiscountTypeService,
    DiscountTypeDao],
  imports: []
})
export class DiscountTypeModule { }
