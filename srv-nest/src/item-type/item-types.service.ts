import { Injectable } from '@nestjs/common';
import { ItemType } from './interfaces/item-type.interface';

@Injectable()
export class ItemTypesService {
  private readonly itemTypes: ItemType[] = [];

  create(itemType: ItemType) {
    this.itemTypes.push(itemType);
  }

  findAll(): ItemType[] {
    return this.itemTypes;
  }
}
