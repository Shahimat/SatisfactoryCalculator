import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';

import { Calculation } from './calculation.entity';
import { CalculationCategory } from './calculation-category.entity';
import { CalculationSchemeLink } from './calculation-scheme-link.entity';
import { CalculationLink } from './calculation-link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Calculation,
      CalculationCategory,
      CalculationSchemeLink,
      CalculationLink,
    ]),
  ],
  providers: [CalculationService],
  controllers: [CalculationController],
  exports: [CalculationService],
})
export class CalculationModule {}
