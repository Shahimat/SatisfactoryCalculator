import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconCategoryController } from './icon-category.controller';
import { IconCategoryService } from './icon-category.service';

import { IconCategory } from './icon-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IconCategory])],
  providers: [IconCategoryService],
  controllers: [IconCategoryController],
  exports: [IconCategoryService],
})
export class IconCategoryModule {}
