import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemeItemLinkController } from './scheme-item-link.controller';
import { SchemeItemLinkService } from './scheme-item-link.service';

import { SchemeModule } from '@src/scheme/scheme.module';
import { ItemModule } from '@src/item/item.module';

import { SchemeItemLink } from './scheme-item-link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchemeItemLink]),
    SchemeModule,
    ItemModule,
  ],
  providers: [SchemeItemLinkService],
  controllers: [SchemeItemLinkController],
  exports: [SchemeItemLinkService],
})
export class SchemeItemLinkModule {}
