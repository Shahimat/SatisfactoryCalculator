import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemeController } from './scheme.controller';
import { SchemeService } from './scheme.service';

import { FactoryModule } from '@src/factory/factory.module';

import { Scheme } from './scheme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scheme]), FactoryModule],
  providers: [SchemeService],
  controllers: [SchemeController],
  exports: [SchemeService],
})
export class SchemeModule {}
