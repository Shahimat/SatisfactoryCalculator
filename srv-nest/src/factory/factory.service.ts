import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FactoryCreateDto, FactoryUpdateDto } from './factory.dto';

import { IconService } from '@src/icon/icon.service';

import { Factory } from './factory.entity';

@Injectable()
export class FactoryService {
  constructor(
    @InjectRepository(Factory)
    private factoryRepo: Repository<Factory>,
    private iconService: IconService,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.factoryRepo
      .createQueryBuilder('factory')
      .select('MAX(factory.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  async findOneWithoutTransform(id: number): Promise<Factory | null> {
    const factory = await this.factoryRepo
      .createQueryBuilder('factory')
      .innerJoinAndSelect('factory.icon', 'icon')
      .where('factory.id = :id', { id })
      .getOne();
    if (factory) {
      return factory;
    } else {
      return null;
    }
  }

  async findAll(): Promise<Factory[]> {
    const factories = await this.factoryRepo
      .createQueryBuilder('factory')
      .innerJoinAndSelect('factory.icon', 'icon')
      .getMany();
    return factories.map(({ icon, ...factoryFiels }) => {
      icon.path = this.iconService.getActualPath(icon.path);
      return {
        icon,
        ...factoryFiels,
      };
    });
  }

  async findOne(id: number): Promise<Factory | null> {
    const factory = await this.findOneWithoutTransform(id);
    if (factory && factory.icon) {
      factory.icon.path = this.iconService.getActualPath(factory.icon.path);
    }
    return factory;
  }

  async create(factoryCreateDto: FactoryCreateDto): Promise<Factory | null> {
    const id = await this.getMaxId();
    const icon = await this.iconService.findOneWithoutTransform(
      factoryCreateDto.idIcon,
    );
    if (icon) {
      const factory = new Factory();
      factory.id = id + 1;
      factory.name = factoryCreateDto.name;
      factory.consumption = factoryCreateDto.consumption;
      factory.isSchemeGeneration = factoryCreateDto.isSchemeGeneration;
      factory.isSchemeConsumption = factoryCreateDto.isSchemeConsumption;
      factory.isAcceleration = factoryCreateDto.isAcceleration;
      factory.tier = factoryCreateDto.tier;
      factory.inputSolid = factoryCreateDto.inputSolid;
      factory.inputLiquid = factoryCreateDto.inputLiquid;
      factory.inputOther = factoryCreateDto.inputOther;
      factory.outputSolid = factoryCreateDto.outputSolid;
      factory.outputLiquid = factoryCreateDto.outputLiquid;
      factory.outputOther = factoryCreateDto.outputOther;
      factory.icon = icon;
      return this.factoryRepo.save(factory);
    } else {
      return null;
    }
  }

  async update(
    id: number,
    factoryUpdateDto: FactoryUpdateDto,
  ): Promise<Factory | null> {
    const factory = await this.findOneWithoutTransform(id);
    if (factory) {
      const icon = factoryUpdateDto.idIcon
        ? await this.iconService.findOneWithoutTransform(
            factoryUpdateDto.idIcon,
          )
        : factory.icon;
      if (icon) {
        factory.name = factoryUpdateDto.name ?? factory.name;
        factory.consumption =
          factoryUpdateDto.consumption ?? factory.consumption;
        factory.isSchemeGeneration =
          factoryUpdateDto.isSchemeGeneration ?? factory.isSchemeGeneration;
        factory.isSchemeConsumption =
          factoryUpdateDto.isSchemeConsumption ?? factory.isSchemeConsumption;
        factory.isAcceleration =
          factoryUpdateDto.isAcceleration ?? factory.isAcceleration;
        factory.inputSolid = factoryUpdateDto.inputSolid ?? factory.inputSolid;
        factory.inputLiquid =
          factoryUpdateDto.inputLiquid ?? factory.inputLiquid;
        factory.inputOther = factoryUpdateDto.inputOther ?? factory.inputOther;
        factory.outputSolid =
          factoryUpdateDto.outputSolid ?? factory.outputSolid;
        factory.outputLiquid =
          factoryUpdateDto.outputLiquid ?? factory.outputLiquid;
        factory.outputOther =
          factoryUpdateDto.outputOther ?? factory.outputOther;
        factory.icon = icon;
        await this.factoryRepo.save(factory);
        factory.icon.path = this.iconService.getActualPath(factory.icon.path);
        return factory;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    await this.factoryRepo.delete(id);
  }
}
