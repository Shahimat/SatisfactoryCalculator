import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';

import { Calculation } from './calculation.entity';
import { CalculationCategory } from './calculation-category.entity';
import { CalculationSchemeLink } from './calculation-scheme-link.entity';
import { CalculationLink } from './calculation-link.entity';
import { SchemeModule } from '../scheme/scheme.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Calculation,
      CalculationCategory,
      CalculationSchemeLink,
      CalculationLink,
    ]),
    SchemeModule,
  ],
  providers: [CalculationService],
  controllers: [CalculationController],
  exports: [CalculationService],
})
export class CalculationModule {}
