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
    private iconCategoryRepo: Repository<IconCategory>,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.iconCategoryRepo
      .createQueryBuilder('icon_category')
      .select('MAX(icon_category.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  findAll(): Promise<IconCategory[]> {
    return this.iconCategoryRepo.find();
  }

  findOne(id: number): Promise<IconCategory | null> {
    return this.iconCategoryRepo.findOneBy({ id });
  }

  async create(
    iconCategoryCreateDto: IconCategoryCreateDto,
  ): Promise<IconCategory> {
    const id = await this.getMaxId();
    const iconCategory = new IconCategory();
    iconCategory.id = id + 1;
    iconCategory.name = iconCategoryCreateDto.name;
    return this.iconCategoryRepo.save(iconCategory);
  }

  async update(
    id: number,
    iconCategoryUpdateDto: IconCategoryUpdateDto,
  ): Promise<IconCategory | null> {
    const iconCategory = await this.findOne(id);
    if (iconCategory) {
      iconCategory.name = iconCategoryUpdateDto.name;
      await this.iconCategoryRepo.save(iconCategory);
      return iconCategory;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.iconCategoryRepo.delete(id);
  }
}
