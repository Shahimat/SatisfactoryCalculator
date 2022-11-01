import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCategoryController } from './item-category.controller';
import { ItemCategoryService } from './item-category.service';

import { ItemCategory } from './item-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCategory])],
  providers: [ItemCategoryService],
  controllers: [ItemCategoryController],
})
export class ItemCategoryModule {}
