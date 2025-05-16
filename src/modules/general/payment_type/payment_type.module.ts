import { Module } from '@nestjs/common';
import { PaymentTypeService } from './services/payment_type.service';
import { PaymentTypeDao } from './dao/payment_type.dao';
import { PaymentTypeController } from './payment_type.controller';

@Module({
  controllers: [PaymentTypeController],
  providers: [
    PaymentTypeService,
    PaymentTypeDao],
  imports: []
})
export class PaymentTypeModule { }
