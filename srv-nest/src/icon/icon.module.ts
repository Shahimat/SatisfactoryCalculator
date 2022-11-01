import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconController } from './icon.controller';
import { IconService } from './icon.service';

import { IconCategoryModule } from '@src/icon-category/icon-category.module';

import { Icon } from './icon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Icon]), IconCategoryModule],
  providers: [IconService],
  controllers: [IconController],
})
export class IconModule {}
