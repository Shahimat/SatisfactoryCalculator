import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
          .leftJoinAndSelect('calc.calculationCategory', 'category')
          .where('category.name = :name', {
            name: filterCategory,
          })
          .getMany()
      : await this.calculationRepo
          .createQueryBuilder('calc')
          .leftJoinAndSelect('calc.calculationCategory', 'category')
          .getMany();
    return calculations;
  }

  async findOne(id: number): Promise<Calculation | null> {
    return await this.calculationRepo
      .createQueryBuilder('calc')
      .leftJoinAndSelect('calc.calculationSchemeLinks', 'calc_scheme')
      .leftJoinAndSelect('calc_scheme.scheme', 'calc_scheme_in')
      .leftJoinAndSelect('calc_scheme_in.factory', 'calc_scheme_factory')
      .leftJoinAndSelect('calc_scheme_factory.icon', 'calc_scheme_factory_icon')
      .leftJoinAndSelect(
        'calc_scheme_in.schemeItemLinks',
        'calc_scheme_item_link',
      )
      .leftJoinAndSelect('calc_scheme_item_link.item', 'calc_item')
      .leftJoinAndSelect('calc_item.icon', 'calc_item_icon')
      .leftJoinAndSelect('calc.calculationAggregationLinks', 'calc_agg')
      .leftJoinAndSelect('calc_agg.calculationLink', 'calc_link')
      .leftJoinAndSelect('calc_link.calculationCategory', 'calc_link_category')
      .leftJoinAndSelect('calc_link.calculationSchemeLinks', 'calc_link_scheme')
      .leftJoinAndSelect('calc_link_scheme.scheme', 'calc_link_scheme_in')
      .leftJoinAndSelect(
        'calc_link_scheme_in.factory',
        'calc_link_scheme_factory',
      )
      .leftJoinAndSelect(
        'calc_link_scheme_factory.icon',
        'calc_link_scheme_factory_icon',
      )
      .leftJoinAndSelect(
        'calc_link_scheme_in.schemeItemLinks',
        'calc_link_scheme_item_link',
      )
      .leftJoinAndSelect('calc_link_scheme_item_link.item', 'calc_link_item')
      .leftJoinAndSelect('calc_link_item.icon', 'calc_link_item_icon')
      .where('calc.id = :id', {
        id,
      })
      .getOne();
  }

  async findAllCategories(): Promise<CalculationCategory[]> {
    console.log('daaa');
    return await this.calculationCategoryRepo.find();
  }

  async findCategoryById(id: number): Promise<CalculationCategory | null> {
    console.log('some');
    return await this.calculationCategoryRepo.findOneBy({ id });
  }

  async findCategoryByName(name: string): Promise<CalculationCategory | null> {
    return await this.calculationCategoryRepo.findOneBy({ name });
  }

  async createCalculation(
    categoryName: string,
    calculationName?: string,
  ): Promise<Calculation> {
    const category = await this.findCategoryByName(categoryName);
    if (category) {
      const id = await this.getMaxId();
      const calculation = new Calculation();
      calculation.id = id + 1;
      calculation.name = calculationName ?? `${category.name}${id}`;
      calculation.calculationCategory = category;
      return await this.calculationRepo.save(calculation);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `category not found by name = ${categoryName}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateCalculation(
    id: number,
    calculationUpdateDto: CalculationUpdateDto,
  ): Promise<Calculation> {
    const calculation = await this.calculationRepo.findOneBy({ id });
    if (calculation) {
      calculation.name = calculationUpdateDto.name ?? calculation.name;
      const category = calculationUpdateDto.category
        ? await this.findCategoryByName(calculationUpdateDto.category)
        : calculation.calculationCategory;
      if (category) {
        calculation.calculationCategory = category;
        return await this.calculationRepo.save(calculation);
      } else {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `category not found by name = ${calculationUpdateDto.category}`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `calculation not found by id = ${id}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async removeCalculation(id: number): Promise<void> {
    await this.calculationRepo.delete(id);
  }
}
