import { Module } from '@nestjs/common';
import { SizeService } from './services/size.service';
import { SizeDao } from './dao/size.dao';
import { SizeController } from './size.controller';

@Module({
  controllers: [SizeController],
  providers: [
    SizeService,
    SizeDao],
  imports: []
})
export class SizeModule { }
