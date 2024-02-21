import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantCreateDto, PlantUpdateDto } from './plant.dto';

import { Plant } from './plant.entity';

@Controller('plant')
export class PlantController {
  constructor(private plantService: PlantService) {}

  @Get()
  findAll(): Promise<Plant[]> {
    return this.plantService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<Plant | null> {
    return this.plantService.findOne(Number(params.id));
  }

  @Post()
  create(@Body() plantCreateDto: PlantCreateDto): Promise<Plant> {
    return this.plantService.create(plantCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() plantUpdateDto: PlantUpdateDto,
  ): Promise<Plant | null> {
    return await this.plantService.update(Number(id), plantUpdateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.plantService.remove(Number(id));
  }
}
