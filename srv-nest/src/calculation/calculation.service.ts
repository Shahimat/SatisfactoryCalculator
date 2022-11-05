import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculationCreateDto, CalculationUpdateDto } from './calculation.dto';

import { Calculation } from './calculation.entity';
import { CalculationCategory } from './calculation-category.entity';
import { CalculationLink } from './calculation-link.entity';
import { CalculationSchemeLink } from './calculation-scheme-link.entity';

@Injectable()
export class CalculationService {
  constructor(
    @InjectRepository(Calculation)
    private calculationRepo: Repository<Calculation>,
    @InjectRepository(CalculationCategory)
    private calculationCategoryRepo: Repository<CalculationCategory>,
    @InjectRepository(CalculationLink)
    private calculationLinkRepo: Repository<CalculationLink>,
    @InjectRepository(CalculationSchemeLink)
    private calculationSchemeLinkRepo: Repository<CalculationSchemeLink>,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.calculationRepo
      .createQueryBuilder('calculation')
      .select('MAX(calculation.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  async findAll(filterCategory?: string): Promise<Calculation[]> {
    const calculations = filterCategory
      ? await this.calculationRepo
          .createQueryBuilder('calc')
          .innerJoinAndSelect('calc.calculationCategory', 'category')
          .where('category.name = :name', {
            name: filterCategory,
          })
          .getMany()
      : await this.calculationRepo
          .createQueryBuilder('calc')
          .innerJoinAndSelect('calc.calculationCategory', 'category')
          .getMany();
    return calculations;
  }

  async findOne(id: number): Promise<Calculation | null> {
    return await this.calculationRepo
      .createQueryBuilder('calc')
      .innerJoinAndSelect('calc.calculationSchemeLinks', 'calc_scheme')
      .innerJoinAndSelect('calc_scheme.scheme', 'calc_scheme_in')
      .innerJoinAndSelect('calc_scheme_in.factory', 'calc_scheme_factory')
      .innerJoinAndSelect(
        'calc_scheme_factory.icon',
        'calc_scheme_factory_icon',
      )
      .innerJoinAndSelect(
        'calc_scheme_in.schemeItemLinks',
        'calc_scheme_item_link',
      )
      .innerJoinAndSelect('calc_scheme_item_link.item', 'calc_item')
      .innerJoinAndSelect('calc_item.icon', 'calc_item_icon')
      .innerJoinAndSelect('calc.calculationAggregationLinks', 'calc_agg')
      .innerJoinAndSelect('calc_agg.calculationLink', 'calc_link')
      .innerJoinAndSelect('calc_link.calculationCategory', 'calc_link_category')
      .innerJoinAndSelect(
        'calc_link.calculationSchemeLinks',
        'calc_link_scheme',
      )
      .innerJoinAndSelect('calc_link_scheme.scheme', 'calc_link_scheme_in')
      .innerJoinAndSelect(
        'calc_link_scheme_in.factory',
        'calc_link_scheme_factory',
      )
      .innerJoinAndSelect(
        'calc_link_scheme_factory.icon',
        'calc_link_scheme_factory_icon',
      )
      .innerJoinAndSelect(
        'calc_link_scheme_in.schemeItemLinks',
        'calc_link_scheme_item_link',
      )
      .innerJoinAndSelect('calc_link_scheme_item_link.item', 'calc_link_item')
      .innerJoinAndSelect('calc_link_item.icon', 'calc_link_item_icon')
      .where('calc.id = :id', {
        id,
      })
      .getOne();
  }

  async findCategory(
    id?: number,
  ): Promise<CalculationCategory[] | CalculationCategory | null> {
    return id
      ? await this.calculationCategoryRepo.findOneBy({ id })
      : await this.calculationCategoryRepo.find();
  }

  async create(
    calculationCreateDto: CalculationCreateDto,
  ): Promise<Calculation | null> {
    return null;
    // const id = await this.getMaxId();
    // const calculation = new Calculation();
    // calculation.id = id + 1;
    // calculation.name = calculationCreateDto.name;
    // return this.calculationRepo.save(calculation);
  }

  async update(
    id: number,
    calculationUpdateDto: CalculationUpdateDto,
  ): Promise<Calculation | null> {
    return null;
    // const calculation = await this.findOne(id);
    // if (calculation) {
    //   calculation.name = calculationUpdateDto.name;
    //   await this.calculationRepo.save(calculation);
    //   return calculation;
    // } else {
    //   return null;
    // }
  }

  async remove(id: number): Promise<void> {
    await this.calculationRepo.delete(id);
  }
}
