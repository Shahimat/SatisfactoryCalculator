import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactoryController } from './factory.controller';
import { FactoryService } from './factory.service';

import { IconModule } from '@src/icon/icon.module';

import { Factory } from './factory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factory]), IconModule],
  providers: [FactoryService],
  controllers: [FactoryController],
  exports: [FactoryService],
})
export class FactoryModule {}
