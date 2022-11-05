import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

import { Item } from './item.entity';

import { ItemTypeModule } from '@src/item-type/item-type.module';
import { ItemCategoryModule } from '@src/item-category/item-category.module';
import { IconModule } from '@src/icon/icon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    ItemTypeModule,
    ItemCategoryModule,
    IconModule,
  ],
  providers: [ItemService],
  controllers: [ItemController],
  exports: [ItemService],
})
export class ItemModule {}
