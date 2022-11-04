import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemCreateDto, ItemUpdateDto } from './item.dto';
import { Item } from './item.entity';

@Controller('item')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Get()
  findAll(): Promise<Item[]> {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Item | null> {
    return this.itemService.findOne(Number(id));
  }

  @Post()
  create(@Body() itemCreateDto: ItemCreateDto): Promise<Item | null> {
    return this.itemService.create(itemCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() itemUpdateDto: ItemUpdateDto,
  ): Promise<Item | null> {
    return await this.itemService.update(Number(id), itemUpdateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.itemService.remove(Number(id));
  }
}
