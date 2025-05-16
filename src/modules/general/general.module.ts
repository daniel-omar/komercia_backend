import { Module } from '@nestjs/common';
import { SizeModule } from './size/size.module';
import { ColorModule } from './color/color.module';
import { BrandModule } from './brand/brand.module';
import { PaymentTypeModule } from './payment_type/payment_type.module';
import { DiscountTypeModule } from './discount_type/discount_type.module';
import { PeriodModule } from './period/period.module';

@Module({
    imports: [
        SizeModule,
        ColorModule,
        BrandModule,
        PaymentTypeModule,
        DiscountTypeModule,
        PeriodModule
    ]
})
export class GeneralModule { }
