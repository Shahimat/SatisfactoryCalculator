import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemTypeDto } from './dto/item-type.dto';

import { ItemType } from './item-type.entity';

@Injectable()
export class ItemTypeService {
  constructor(
    @InjectRepository(ItemType)
    private itemTypesRepo: Repository<ItemType>,
  ) {}

  findAll(): Promise<ItemType[]> {
    return this.itemTypesRepo.find();
  }

  findOne(id: number): Promise<ItemType | null> {
    return this.itemTypesRepo.findOneBy({ id });
  }

  async create(itemTypeDto: ItemTypeDto): Promise<ItemType> {
    const itemTypes = await this.findAll();
    const itemType = new ItemType();
    itemType.id = (itemTypes[itemTypes.length - 1]?.id ?? -1) + 1;
    itemType.name = itemTypeDto.name;
    return this.itemTypesRepo.save(itemType);
  }

  async update(id: number, itemTypeDto: ItemTypeDto): Promise<ItemType | null> {
    const itemType = await this.findOne(id);
    if (itemType) {
      itemType.name = itemTypeDto.name;
      await this.itemTypesRepo.save(itemType);
      return itemType;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.itemTypesRepo.delete(id);
  }
}
