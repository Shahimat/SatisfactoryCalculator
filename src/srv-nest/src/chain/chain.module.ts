import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';

import { Chain } from './chain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chain])],
  providers: [ChainService],
  controllers: [ChainController],
  exports: [ChainService],
})
export class ChainModule {}
