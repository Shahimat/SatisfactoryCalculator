import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculationCreateDto, CalculationUpdateDto } from './calculation.dto';

import { Calculation } from './calculation.entity';

@Injectable()
export class CalculationService {
  constructor(
    @InjectRepository(Calculation)
    private calculationRepo: Repository<Calculation>,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.calculationRepo
      .createQueryBuilder('calculation')
      .select('MAX(calculation.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  findAll(): Promise<Calculation[]> {
    return this.calculationRepo.find();
  }

  findOne(id: number): Promise<Calculation | null> {
    return this.calculationRepo.findOneBy({ id });
  }

  async create(
    calculationCreateDto: CalculationCreateDto,
  ): Promise<Calculation> {
    const id = await this.getMaxId();
    const calculation = new Calculation();
    calculation.id = id + 1;
    calculation.name = calculationCreateDto.name;
    return this.calculationRepo.save(calculation);
  }

  async update(
    id: number,
    calculationUpdateDto: CalculationUpdateDto,
  ): Promise<Calculation | null> {
    const calculation = await this.findOne(id);
    if (calculation) {
      calculation.name = calculationUpdateDto.name;
      await this.calculationRepo.save(calculation);
      return calculation;
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.calculationRepo.delete(id);
  }
}
