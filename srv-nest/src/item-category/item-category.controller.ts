import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ItemCategoryService } from './item-category.service';
import {
  ItemCategoryCreateDto,
  ItemCategoryUpdateDto,
} from './item-category.dto';
import { ItemCategory } from './item-category.entity';

@Controller('item-category')
export class ItemCategoryController {
  constructor(private itemCategoryService: ItemCategoryService) {}

  @Get()
  findAll(): Promise<ItemCategory[]> {
    return this.itemCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<ItemCategory | null> {
    return this.itemCategoryService.findOne(Number(params.id));
  }

  @Post()
  create(@Body() itemTypeDto: ItemCategoryCreateDto): Promise<ItemCategory> {
    return this.itemCategoryService.create(itemTypeDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() itemTypeDto: ItemCategoryUpdateDto,
  ): Promise<ItemCategory | null> {
    return await this.itemCategoryService.update(Number(id), itemTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.itemCategoryService.remove(Number(id));
  }
}
