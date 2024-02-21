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

  async getMaxId(): Promise<number> {
    const result = await this.itemCategoryRepo
      .createQueryBuilder('item_category')
      .select('MAX(item_category.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  findAll(): Promise<ItemCategory[]> {
    return this.itemCategoryRepo.find();
  }

  findOne(id: number): Promise<ItemCategory | null> {
    return this.itemCategoryRepo.findOneBy({ id });
  }

  async create(
    itemCategoryCreateDto: ItemCategoryCreateDto,
  ): Promise<ItemCategory> {
    const id = await this.getMaxId();
    const itemCategory = new ItemCategory();
    itemCategory.id = id + 1;
    itemCategory.name = itemCategoryCreateDto.name;
    itemCategory.isInternalEnergy =
      itemCategoryCreateDto.isInternalEnergy ?? false;
    return this.itemCategoryRepo.save(itemCategory);
  }

  async update(
    id: number,
    itemCategoryUpdateDto: ItemCategoryUpdateDto,
  ): Promise<ItemCategory | null> {
    const itemCategory = await this.findOne(id);
    if (itemCategory) {
      itemCategory.name = itemCategoryUpdateDto.name;
      itemCategory.isInternalEnergy =
        itemCategoryUpdateDto.isInternalEnergy ?? itemCategory.isInternalEnergy;
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
