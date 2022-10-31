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
import { ItemTypeDto } from './dto/item-type.dto';

import { ItemType } from './entities/item-type.entity';

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
  create(@Body() itemTypeDto: ItemTypeDto): Promise<ItemType> {
    return this.itemTypeService.create(itemTypeDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() itemTypeDto: ItemTypeDto,
  ): Promise<ItemType | null> {
    return await this.itemTypeService.update(Number(id), itemTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.itemTypeService.remove(Number(id));
  }
}
