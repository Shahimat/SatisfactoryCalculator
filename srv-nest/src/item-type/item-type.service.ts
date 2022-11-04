import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemTypeCreateDto, ItemTypeUpdateDto } from './item-type.dto';

import { ItemType } from './item-type.entity';

@Injectable()
export class ItemTypeService {
  constructor(
    @InjectRepository(ItemType)
    private itemTypeRepo: Repository<ItemType>,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.itemTypeRepo
      .createQueryBuilder('item_type')
      .select('MAX(item_type.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  findAll(): Promise<ItemType[]> {
    return this.itemTypeRepo.find();
  }

  findOne(id: number): Promise<ItemType | null> {
    return this.itemTypeRepo.findOneBy({ id });
  }

  async create(itemTypeCreateDto: ItemTypeCreateDto): Promise<ItemType> {
    const itemType = new ItemType();
    const id = await this.getMaxId();
    itemType.id = id + 1;
    itemType.name = itemTypeCreateDto.name;
    return this.itemTypeRepo.save(itemType);
  }

  async update(
    id: number,
    itemTypeUpdateDto: ItemTypeUpdateDto,
  ): Promise<ItemType | null> {
    const itemType = await this.findOne(id);
    if (itemType) {
      itemType.name = itemTypeUpdateDto.name;
      await this.itemTypeRepo.save(itemType);
      return itemType;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.itemTypeRepo.delete(id);
  }
}
