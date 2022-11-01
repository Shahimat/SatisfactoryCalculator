import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IconCategoryCreateDto,
  IconCategoryUpdateDto,
} from './icon-category.dto';

import { IconCategory } from './icon-category.entity';

@Injectable()
export class IconCategoryService {
  constructor(
    @InjectRepository(IconCategory)
    private itemCategoryRepo: Repository<IconCategory>,
  ) {}

  findAll(): Promise<IconCategory[]> {
    return this.itemCategoryRepo.find();
  }

  findOne(id: number): Promise<IconCategory | null> {
    return this.itemCategoryRepo.findOneBy({ id });
  }

  async create(
    iconCategoryCreateDto: IconCategoryCreateDto,
  ): Promise<IconCategory> {
    const iconCategories = await this.findAll();
    const iconCategory = new IconCategory();
    iconCategory.id = (iconCategories[iconCategories.length - 1]?.id ?? -1) + 1;
    iconCategory.name = iconCategoryCreateDto.name;
    return this.itemCategoryRepo.save(iconCategory);
  }

  async update(
    id: number,
    iconCategoryUpdateDto: IconCategoryUpdateDto,
  ): Promise<IconCategory | null> {
    const iconCategory = await this.findOne(id);
    if (iconCategory) {
      iconCategory.name = iconCategoryUpdateDto.name;
      await this.itemCategoryRepo.save(iconCategory);
      return iconCategory;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.itemCategoryRepo.delete(id);
  }
}
