import { Module } from '@nestjs/common';
import { ColorService } from './services/color.service';
import { ColorDao } from './dao/color.dao';
import { ColorController } from './color.controller';

@Module({
  controllers: [ColorController],
  providers: [
    ColorService,
    ColorDao],
  imports: []
})
export class ColorModule { }
