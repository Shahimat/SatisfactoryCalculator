import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ItemTypesService } from './item-types.service';
import { ItemType } from './interfaces/item-type.interface';

@Controller('item-type')
export class ItemTypeController {
  constructor(private itemTypesServise: ItemTypesService) {}

  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Req() request: Request): ItemType[] {
    return this.itemTypesServise.findAll();
  }
}
