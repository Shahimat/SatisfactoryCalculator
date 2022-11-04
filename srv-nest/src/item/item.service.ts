import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemCreateDto, ItemUpdateDto } from './item.dto';

import { ItemCategoryService } from '@src/item-category/item-category.service';
import { ItemTypeService } from '@src/item-type/item-type.service';
import { IconService } from '@src/icon/icon.service';

import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
    private itemTypeService: ItemTypeService,
    private itemCategoryService: ItemCategoryService,
    private iconService: IconService,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.itemRepo
      .createQueryBuilder('item')
      .select('MAX(item.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  findAll(): Promise<Item[]> {
    return this.itemRepo
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.itemType', 'type')
      .innerJoinAndSelect('item.itemCategory', 'category')
      .innerJoinAndSelect('item.icon', 'icon')
      .getMany();
  }

  findOne(id: number): Promise<Item | null> {
    return this.itemRepo
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.itemType', 'type')
      .innerJoinAndSelect('item.itemCategory', 'category')
      .innerJoinAndSelect('item.icon', 'icon')
      .where('item.id = :id', { id })
      .getOne();
  }

  async create(itemCreateDto: ItemCreateDto): Promise<Item | null> {
    const id = await this.getMaxId();
    const [itemType, itemCategory, icon] = await Promise.all([
      this.itemTypeService.findOne(itemCreateDto.idItemType),
      this.itemCategoryService.findOne(itemCreateDto.idItemCategory),
      this.iconService.findOne(itemCreateDto.idIcon),
    ]);
    if (itemType && itemCategory && icon) {
      const item = new Item();
      item.id = id + 1;
      item.name = itemCreateDto.name;
      if (itemCategory.isInternalEnergy) {
        if (itemCreateDto.energy !== undefined) {
          item.energy = itemCreateDto.energy;
        } else {
          throw new Error(
            `error: itemCategory requires internal energy but found ${itemCreateDto.energy}`,
          );
        }
      }
      item.itemType = itemType;
      item.itemCategory = itemCategory;
      item.icon = icon;
      return this.itemRepo.save(item);
    } else {
      const errorStack: string[] = [];
      if (itemType === null) {
        errorStack.push(
          `expected itemType by id = ${itemCreateDto.idItemType} but found null`,
        );
      }
      if (itemCategory === null) {
        errorStack.push(
          `expected itemCategory by id = ${itemCreateDto.idItemCategory} but found null`,
        );
      }
      if (icon === null) {
        errorStack.push(
          `expected icon by id = ${itemCreateDto.idIcon} but found null`,
        );
      }
      throw new Error(
        `error: getting data from database\n${errorStack.join('\n')}`,
      );
    }
  }

  async update(id: number, itemUpdateDto: ItemUpdateDto): Promise<Item | null> {
    const item = await this.findOne(id);
    if (item) {
      const itemType = itemUpdateDto.idItemType
        ? await this.itemTypeService.findOne(itemUpdateDto.idItemType)
        : item.itemType;
      const itemCategory = itemUpdateDto.idItemCategory
        ? await this.itemCategoryService.findOne(itemUpdateDto.idItemCategory)
        : item.itemCategory;
      const icon = itemUpdateDto.idIcon
        ? await this.iconService.findOne(itemUpdateDto.idIcon)
        : item.icon;
      if (itemType && itemCategory && icon) {
        if (itemCategory.isInternalEnergy) {
          if (itemUpdateDto.energy !== undefined) {
            item.energy = itemUpdateDto.energy;
          } else if (item.energy === null) {
            throw new Error(
              `error: itemCategory requires internal energy but found ${itemUpdateDto.energy}`,
            );
          }
        }
        item.name = itemUpdateDto.name ?? item.name;
        item.itemType = itemType;
        item.itemCategory = itemCategory;
        item.icon = icon;
        return await this.itemRepo.save(item);
      } else {
        const errorStack: string[] = [];
        if (itemType === null) {
          errorStack.push(
            `expected itemType by id = ${itemUpdateDto.idItemType} but found null`,
          );
        }
        if (itemCategory === null) {
          errorStack.push(
            `expected itemCategory by id = ${itemUpdateDto.idItemCategory} but found null`,
          );
        }
        if (icon === null) {
          errorStack.push(
            `expected icon by id = ${itemUpdateDto.idIcon} but found null`,
          );
        }
        throw new Error(
          `error: getting data from database\n${errorStack.join('\n')}`,
        );
      }
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.itemRepo.delete(id);
  }
}
