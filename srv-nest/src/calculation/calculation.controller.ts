import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { CalculationCreateDto, CalculationUpdateDto } from './calculation.dto';

import { Calculation } from './calculation.entity';

@Controller('calculation')
export class CalculationController {
  constructor(private calculationService: CalculationService) {}

  @Get()
  findAll(): Promise<Calculation[]> {
    return this.calculationService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<Calculation | null> {
    return this.calculationService.findOne(Number(params.id));
  }

  @Post()
  create(
    @Body() calculationCreateDto: CalculationCreateDto,
  ): Promise<Calculation> {
    return this.calculationService.create(calculationCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() calculationUpdateDto: CalculationUpdateDto,
  ): Promise<Calculation | null> {
    return await this.calculationService.update(
      Number(id),
      calculationUpdateDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.calculationService.remove(Number(id));
  }
}
