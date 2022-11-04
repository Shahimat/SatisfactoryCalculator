import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SchemeService } from './scheme.service';
import { SchemeCreateDto, SchemeUpdateDto } from './scheme.dto';
import { Scheme } from './scheme.entity';

@Controller('scheme')
export class SchemeController {
  constructor(private schemeService: SchemeService) {}

  @Get()
  findAll(): Promise<Scheme[]> {
    return this.schemeService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<Scheme | null> {
    return this.schemeService.findOne(Number(params.id));
  }

  @Post()
  create(@Body() schemeCreateDto: SchemeCreateDto): Promise<Scheme | null> {
    return this.schemeService.create(schemeCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() schemeUpdateDto: SchemeUpdateDto,
  ): Promise<Scheme | null> {
    return await this.schemeService.update(Number(id), schemeUpdateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.schemeService.remove(Number(id));
  }
}
