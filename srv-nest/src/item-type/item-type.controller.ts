import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ItemTypeService } from './item-type.service';
import { ItemTypeDto } from './dto/item-type.dto';

import { ItemType } from './interfaces/item-type.interface';

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
  create(@Body() itemTypeDto: ItemTypeDto): string {
    console.log(itemTypeDto);
    return 'da';
  }
}
