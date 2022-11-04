import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantController } from './plant.controller';
import { PlantService } from './plant.service';

import { Plant } from './plant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plant])],
  providers: [PlantService],
  controllers: [PlantController],
  exports: [PlantService],
})
export class PlantModule {}
