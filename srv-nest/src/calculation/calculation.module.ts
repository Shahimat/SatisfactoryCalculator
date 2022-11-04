import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';

import { Calculation } from './calculation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calculation])],
  providers: [CalculationService],
  controllers: [CalculationController],
  exports: [CalculationService],
})
export class CalculationModule {}
