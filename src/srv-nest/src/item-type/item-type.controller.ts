import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ItemTypeService } from './item-type.service';
import { ItemTypeCreateDto, ItemTypeUpdateDto } from './item-type.dto';

import { ItemType } from './item-type.entity';

@Controller('item-type')
export class ItemTypeController {
  constructor(private itemTypeService: ItemTypeService) {}

  @Get()
  findAll(): Promise<ItemType[]> {
    return this.itemTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<ItemType | null> {
    return this.itemTypeService.findOne(Number(params.id));
  }

  @Post()
  create(@Body() itemTypeCreateDto: ItemTypeCreateDto): Promise<ItemType> {
    return this.itemTypeService.create(itemTypeCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() itemTypeUpdateDto: ItemTypeUpdateDto,
  ): Promise<ItemType | null> {
    return await this.itemTypeService.update(Number(id), itemTypeUpdateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.itemTypeService.remove(Number(id));
  }
}
