import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { CalculationService } from './calculation.service';
import {
  CalculationGetAllDto,
  CalculationCreateDto,
  CalculationUpdateDto,
  AddSchemesToCalculation,
  ChangeSchemesToTargetCalculation,
} from './calculation.dto';

import { Calculation } from './calculation.entity';
import { CalculationCategory } from './calculation-category.entity';
import { CalculationLink } from './calculation-link.entity';
import { CalculationSchemeLink } from './calculation-scheme-link.entity';

@Controller('calculation')
export class CalculationController {
  constructor(private calculationService: CalculationService) {}

  @Get()
  findAll(@Query() query: CalculationGetAllDto): Promise<Calculation[]> {
    return this.calculationService.findAll(query.name);
  }

  @Get('/category')
  findAllCategories(): Promise<CalculationCategory[]> {
    return this.calculationService.findAllCategories();
  }

  @Get('/category/:id')
  findCategory(@Param('id') id: number): Promise<CalculationCategory | null> {
    return this.calculationService.findCategoryById(id);
  }

  @Post('/scheme')
  addSchemesToCalculation(
    @Body() body: AddSchemesToCalculation,
  ): Promise<void> {
    return this.calculationService.addSchemesToCalculation(
      body.calculationId,
      body.schemeIds,
    );
  }

  @Patch('/scheme/:id')
  changeSchemesToTargetCalculation(
    @Param('id') id: number,
    @Body() body: ChangeSchemesToTargetCalculation,
  ): Promise<void> {
    return this.calculationService.changeSchemesToTargetCalculation(
      id,
      body.calculationIdTarget,
      body.schemeLinkIds,
    );
  }

  @Get(':id')
  findOne(@Param() params): Promise<Calculation | null> {
    return this.calculationService.findOne(Number(params.id));
  }

  @Post()
  createCalculation(
    @Query() query: CalculationCreateDto,
  ): Promise<Calculation> {
    return this.calculationService.createCalculation(query.category);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() calculationUpdateDto: CalculationUpdateDto,
  ): Promise<Calculation | null> {
    return await this.calculationService.updateCalculation(
      id,
      calculationUpdateDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.calculationService.removeCalculation(id);
  }
}
