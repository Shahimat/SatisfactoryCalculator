import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Chain } from './chain.entity';

@Injectable()
export class ChainService {
  constructor(
    @InjectRepository(Chain)
    private chainRepo: Repository<Chain>,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.chainRepo
      .createQueryBuilder('chain')
      .select('MAX(chain.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  findAll(): Promise<Chain[]> {
    return this.chainRepo.find();
  }

  findOne(id: number): Promise<Chain | null> {
    return this.chainRepo.findOneBy({ id });
  }

  async create(): Promise<Chain> {
    const id = await this.getMaxId();
    const chain = new Chain();
    chain.id = id + 1;
    return await this.chainRepo.save(chain);
  }

  async remove(id: number): Promise<void> {
    await this.chainRepo.delete(id);
  }
}
