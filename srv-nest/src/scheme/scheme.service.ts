import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchemeCreateDto, SchemeUpdateDto } from './scheme.dto';

import { FactoryService } from '@src/factory/factory.service';

import { Scheme } from './scheme.entity';

@Injectable()
export class SchemeService {
  constructor(
    @InjectRepository(Scheme)
    private schemeRepo: Repository<Scheme>,
    private factoryService: FactoryService,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.schemeRepo
      .createQueryBuilder('scheme')
      .select('MAX(scheme.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  async findAll(): Promise<Scheme[]> {
    return await this.schemeRepo
      .createQueryBuilder('scheme')
      .innerJoinAndSelect('scheme.factory', 'category')
      .getMany();
  }

  async findOne(id: number): Promise<Scheme | null> {
    return await this.schemeRepo
      .createQueryBuilder('scheme')
      .innerJoinAndSelect('scheme.factory', 'factory')
      .where('scheme.id = :id', { id })
      .getOne();
  }

  async create(schemeCreateDto: SchemeCreateDto): Promise<Scheme | null> {
    const id = await this.getMaxId();
    const factory = await this.factoryService.findOne(
      schemeCreateDto.idFactory,
    );
    if (factory) {
      if (
        factory.isSchemeGeneration &&
        (schemeCreateDto.generation === undefined ||
          schemeCreateDto.generation < 0)
      ) {
        throw new Error(`expected generation >= 0 but found undefined`);
      } else if (
        factory.isSchemeConsumption &&
        (schemeCreateDto.generation === undefined ||
          schemeCreateDto.generation > 0)
      ) {
        throw new Error(`expected generation <= 0 but found undefined`);
      } else if (
        !factory.isSchemeGeneration &&
        !factory.isSchemeConsumption &&
        schemeCreateDto.generation !== undefined &&
        schemeCreateDto.generation !== 0
      ) {
        throw new Error(
          `expected generation 0 for factory ${factory.name} but found ${schemeCreateDto.generation}`,
        );
      } else {
        const scheme = new Scheme();
        scheme.id = id + 1;
        scheme.name = schemeCreateDto.name;
        scheme.generation = schemeCreateDto.generation ?? 0;
        scheme.factory = factory;
        return this.schemeRepo.save(scheme);
      }
    } else {
      throw new Error(
        `expected factory by id ${schemeCreateDto.idFactory} but found undefined`,
      );
    }
  }

  async update(
    id: number,
    schemeUpdateDto: SchemeUpdateDto,
  ): Promise<Scheme | null> {
    const scheme = await this.findOne(id);
    if (scheme) {
      const factory = schemeUpdateDto.idFactory
        ? await this.factoryService.findOne(schemeUpdateDto.idFactory)
        : scheme.factory;
      if (factory) {
        if (
          factory.isSchemeGeneration &&
          (schemeUpdateDto.generation === undefined ||
            schemeUpdateDto.generation < 0)
        ) {
          throw new Error(`expected generation >= 0 but found undefined`);
        } else if (
          factory.isSchemeConsumption &&
          (schemeUpdateDto.generation === undefined ||
            schemeUpdateDto.generation > 0)
        ) {
          throw new Error(`expected generation <= 0 but found undefined`);
        } else if (
          !factory.isSchemeGeneration &&
          !factory.isSchemeConsumption &&
          schemeUpdateDto.generation !== undefined &&
          schemeUpdateDto.generation !== 0
        ) {
          throw new Error(
            `expected generation 0 for factory ${factory.name} but found ${schemeUpdateDto.generation}`,
          );
        } else {
          scheme.name = schemeUpdateDto.name ?? scheme.name;
          scheme.factory = factory;
          scheme.generation =
            factory.isSchemeGeneration || factory.isSchemeConsumption
              ? schemeUpdateDto.generation
              : 0;
          return this.schemeRepo.save(scheme);
        }
      } else {
        throw new Error(
          `expected factory by id ${schemeUpdateDto.idFactory} but found undefined`,
        );
      }
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.schemeRepo.delete(id);
  }
}
