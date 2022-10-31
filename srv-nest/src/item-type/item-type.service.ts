import { Injectable } from '@nestjs/common';
import { ItemTypeDto } from './dto/item-type.dto';

import { ItemType } from './interfaces/item-type.interface';

@Injectable()
export class ItemTypeService {
  private readonly itemTypes: ItemType[] = [
    {
      id: 0,
      name: 'wow',
    },
    {
      id: 1,
      name: 'da',
    },
  ];

  findAll(): Promise<ItemType[]> {
    return new Promise((res, rej) => {
      res(this.itemTypes);
    });
  }

  findOne(id: number): Promise<ItemType | null> {
    return new Promise((res, rej) => {
      res(this.itemTypes[id]);
    });
  }

  // create(itemTypeDto: ItemTypeDto): Promise<void> {
  //   this.itemTypeModel.create(itemTypeDto);
  // }
}
