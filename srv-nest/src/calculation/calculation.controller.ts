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

  @Get(':id')
  findOne(@Param() params): Promise<Calculation | null> {
    return this.calculationService.findOne(Number(params.id));
  }

  @Get('/category')
  findCategory(): Promise<CalculationCategory[] | CalculationCategory | any> {
    return this.calculationService.findCategory();
  }

  @Get('/category/:id')
  findCategoryById(
    @Param() params,
  ): Promise<CalculationCategory[] | CalculationCategory | any> {
    return this.calculationService.findCategory(Number(params.id));
  }

  // @Post()
  // create(
  //   @Body() calculationCreateDto: CalculationCreateDto,
  // ): Promise<Calculation> {
  //   return this.calculationService.create(calculationCreateDto);
  // }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() calculationUpdateDto: CalculationUpdateDto,
  // ): Promise<Calculation | null> {
  //   return await this.calculationService.update(
  //     Number(id),
  //     calculationUpdateDto,
  //   );
  // }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.calculationService.remove(Number(id));
  }
}
