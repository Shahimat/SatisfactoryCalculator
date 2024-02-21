import path from 'path';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IconCreateDto, IconUpdateDto } from './icon.dto';

import { env } from '../config';

import { IconCategoryService } from '@src/icon-category/icon-category.service';

import { Icon } from './icon.entity';

@Injectable()
export class IconService {
  constructor(
    @InjectRepository(Icon)
    private iconRepo: Repository<Icon>,
    private iconCategoryService: IconCategoryService,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.iconRepo
      .createQueryBuilder('icon')
      .select('MAX(icon.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  getActualPath(iconPath: string): string {
    return path.join(`/${env.ASSETS_DIR_NAME}`, iconPath);
  }

  async findOneWithoutTransform(id: number): Promise<Icon | null> {
    const icon = await this.iconRepo
      .createQueryBuilder('icon')
      .innerJoinAndSelect('icon.iconCategory', 'category')
      .where('icon.id = :id', { id })
      .getOne();
    if (icon) {
      return icon;
    } else {
      return null;
    }
  }

  async findAll(): Promise<Icon[]> {
    const icons = await this.iconRepo
      .createQueryBuilder('icon')
      .innerJoinAndSelect('icon.iconCategory', 'category')
      .getMany();
    return icons.map(({ path: iconPath, ...iconFiels }) => ({
      path: this.getActualPath(iconPath),
      ...iconFiels,
    }));
  }

  async findOne(id: number): Promise<Icon | null> {
    const icon = await this.findOneWithoutTransform(id);
    if (icon) {
      icon.path = this.getActualPath(icon.path);
    }
    return icon;
  }

  async create(iconCreateDto: IconCreateDto): Promise<Icon | null> {
    const id = await this.getMaxId();
    const iconCategory = await this.iconCategoryService.findOne(
      iconCreateDto.idIconCategory,
    );
    if (iconCategory) {
      const icon = new Icon();
      icon.id = id + 1;
      icon.name = iconCreateDto.name;
      icon.path = iconCreateDto.path;
      icon.iconCategory = iconCategory;
      return this.iconRepo.save(icon);
    } else {
      return null;
    }
  }

  async update(id: number, iconUpdateDto: IconUpdateDto): Promise<Icon | null> {
    const icon = await this.findOneWithoutTransform(id);
    if (icon) {
      const iconCategory = iconUpdateDto.idIconCategory
        ? await this.iconCategoryService.findOne(iconUpdateDto.idIconCategory)
        : icon.iconCategory;
      if (iconCategory) {
        icon.name = iconUpdateDto.name ?? icon.name;
        icon.path = iconUpdateDto.path ?? icon.path;
        await this.iconRepo.save(icon);
        icon.path = this.getActualPath(icon.path);
        return icon;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.iconRepo.delete(id);
  }
}
