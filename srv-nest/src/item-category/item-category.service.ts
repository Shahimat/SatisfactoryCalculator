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

  async create(
    itemCategoryCreateDto: ItemCategoryCreateDto,
  ): Promise<ItemCategory> {
    const itemCategories = await this.findAll();
    const itemCategory = new ItemCategory();
    itemCategory.id = (itemCategories[itemCategories.length - 1]?.id ?? -1) + 1;
    itemCategory.name = itemCategoryCreateDto.name;
    return this.itemCategoryRepo.save(itemCategory);
  }

  async update(
    id: number,
    itemCategoryUpdateDto: ItemCategoryUpdateDto,
  ): Promise<ItemCategory | null> {
    const itemCategory = await this.findOne(id);
    if (itemCategory) {
      itemCategory.name = itemCategoryUpdateDto.name;
      await this.itemCategoryRepo.save(itemCategory);
      return itemCategory;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.itemCategoryRepo.delete(id);
  }
}
