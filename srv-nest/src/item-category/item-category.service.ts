import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ItemCategoryCreateDto,
  ItemCategoryUpdateDto,
} from './item-category.dto';

import { ItemCategory } from './item-category.entity';

@Injectable()
export class ItemCategoryService {
  constructor(
    @InjectRepository(ItemCategory)
    private itemCategoryRepo: Repository<ItemCategory>,
  ) {}

  findAll(): Promise<ItemCategory[]> {
    return this.itemCategoryRepo.find();
  }

  findOne(id: number): Promise<ItemCategory | null> {
    return this.itemCategoryRepo.findOneBy({ id });
  }

  async create(itemTypeDto: ItemCategoryCreateDto): Promise<ItemCategory> {
    const itemTypes = await this.findAll();
    const itemType = new ItemCategory();
    itemType.id = (itemTypes[itemTypes.length - 1]?.id ?? -1) + 1;
    itemType.name = itemTypeDto.name;
    return this.itemCategoryRepo.save(itemType);
  }

  async update(
    id: number,
    itemTypeDto: ItemCategoryUpdateDto,
  ): Promise<ItemCategory | null> {
    const itemType = await this.findOne(id);
    if (itemType) {
      itemType.name = itemTypeDto.name;
      await this.itemCategoryRepo.save(itemType);
      return itemType;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.itemCategoryRepo.delete(id);
  }
}
