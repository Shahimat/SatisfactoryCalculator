import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { IconCategoryService } from './icon-category.service';
import {
  IconCategoryCreateDto,
  IconCategoryUpdateDto,
} from './icon-category.dto';
import { IconCategory } from './icon-category.entity';

@Controller('icon_category')
export class IconCategoryController {
  constructor(private iconCategoryService: IconCategoryService) {}

  @Get()
  findAll(): Promise<IconCategory[]> {
    return this.iconCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<IconCategory | null> {
    return this.iconCategoryService.findOne(Number(params.id));
  }

  @Post()
  create(@Body() itemTypeDto: IconCategoryCreateDto): Promise<IconCategory> {
    return this.iconCategoryService.create(itemTypeDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() itemTypeDto: IconCategoryUpdateDto,
  ): Promise<IconCategory | null> {
    return await this.iconCategoryService.update(Number(id), itemTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.iconCategoryService.remove(Number(id));
  }
}
