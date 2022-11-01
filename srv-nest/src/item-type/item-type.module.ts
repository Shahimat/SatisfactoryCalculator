import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemTypeController } from './item-type.controller';
import { ItemTypeService } from './item-type.service';

import { ItemType } from './item-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemType])],
  providers: [ItemTypeService],
  controllers: [ItemTypeController],
})
export class ItemTypeModule {
  // constructor(private itemTypeService: ItemTypeService) {}
}
