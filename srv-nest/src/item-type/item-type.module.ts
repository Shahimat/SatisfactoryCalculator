import { Module } from '@nestjs/common';
import { ItemTypeController } from './item-type.controller';
import { ItemTypeService } from './item-type.service';

@Module({
  imports: [],
  providers: [ItemTypeService],
  controllers: [ItemTypeController],
})
export class ItemTypeModule {
  // constructor(private itemTypeService: ItemTypeService) {}
}
