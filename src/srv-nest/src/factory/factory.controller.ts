import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { FactoryService } from './factory.service';
import { FactoryCreateDto, FactoryUpdateDto } from './factory.dto';
import { Factory } from './factory.entity';

@Controller('factory')
export class FactoryController {
  constructor(private factoryService: FactoryService) {}

  @Get()
  findAll(): Promise<Factory[]> {
    return this.factoryService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<Factory | null> {
    return this.factoryService.findOne(Number(params.id));
  }

  @Post()
  create(@Body() factoryCreateDto: FactoryCreateDto): Promise<Factory | null> {
    return this.factoryService.create(factoryCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() factoryUpdateDto: FactoryUpdateDto,
  ): Promise<Factory | null> {
    return await this.factoryService.update(Number(id), factoryUpdateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.factoryService.remove(Number(id));
  }
}
