import { Module } from '@nestjs/common';
import { PeriodService } from './services/period.service';
import { PeriodDao } from './dao/period.dao';
import { PeriodController } from './period.controller';

@Module({
  controllers: [PeriodController],
  providers: [
    PeriodService,
    PeriodDao],
  imports: []
})
export class PeriodModule { }
