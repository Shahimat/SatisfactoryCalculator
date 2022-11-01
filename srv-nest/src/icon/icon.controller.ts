import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { IconService } from './icon.service';
import { IconCreateDto, IconUpdateDto } from './icon.dto';
import { Icon } from './icon.entity';

@Controller('icon')
export class IconController {
  constructor(private iconService: IconService) {}

  @Get()
  findAll(): Promise<Icon[]> {
    return this.iconService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<Icon | null> {
    return this.iconService.findOne(Number(params.id));
  }

  @Post()
  create(@Body() iconCreateDto: IconCreateDto): Promise<Icon | null> {
    return this.iconService.create(iconCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() iconUpdateDto: IconUpdateDto,
  ): Promise<Icon | null> {
    return await this.iconService.update(Number(id), iconUpdateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.iconService.remove(Number(id));
  }
}
