import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantCreateDto, PlantUpdateDto } from './plant.dto';

import { Plant } from './plant.entity';

@Injectable()
export class PlantService {
  constructor(
    @InjectRepository(Plant)
    private plantRepo: Repository<Plant>,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.plantRepo
      .createQueryBuilder('plant')
      .select('MAX(plant.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  findAll(): Promise<Plant[]> {
    return this.plantRepo.find();
  }

  findOne(id: number): Promise<Plant | null> {
    return this.plantRepo.findOneBy({ id });
  }

  async create(plantCreateDto: PlantCreateDto): Promise<Plant> {
    const id = await this.getMaxId();
    const plant = new Plant();
    plant.id = id + 1;
    plant.name = plantCreateDto.name;
    return this.plantRepo.save(plant);
  }

  async update(
    id: number,
    plantUpdateDto: PlantUpdateDto,
  ): Promise<Plant | null> {
    const plant = await this.findOne(id);
    if (plant) {
      plant.name = plantUpdateDto.name;
      await this.plantRepo.save(plant);
      return plant;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.plantRepo.delete(id);
  }
}
