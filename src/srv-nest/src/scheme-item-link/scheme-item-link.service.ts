import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SchemeItemLinkCreateDto,
  SchemeItemLinkUpdateDto,
} from './scheme-item-link.dto';

import { SchemeService } from '@src/scheme/scheme.service';
import { ItemService } from '@src/item/item.service';

import { SchemeItemLink } from './scheme-item-link.entity';

@Injectable()
export class SchemeItemLinkService {
  constructor(
    @InjectRepository(SchemeItemLink)
    private schemeItemLinkRepo: Repository<SchemeItemLink>,
    private schemeService: SchemeService,
    private itemService: ItemService,
  ) {}

  async getMaxId(): Promise<number> {
    const result = await this.schemeItemLinkRepo
      .createQueryBuilder('schemeItemLink')
      .select('MAX(schemeItemLink.id)', 'max')
      .getRawOne<{ max: number }>();
    return result ? result.max : -1;
  }

  async findAll(): Promise<SchemeItemLink[]> {
    return await this.schemeItemLinkRepo
      .createQueryBuilder('schemeItemLink')
      .innerJoinAndSelect('schemeItemLink.scheme', 'scheme')
      .innerJoinAndSelect('schemeItemLink.item', 'item')
      .getMany();
  }

  async findOne(id: number): Promise<SchemeItemLink | null> {
    return await this.schemeItemLinkRepo
      .createQueryBuilder('schemeItemLink')
      .innerJoinAndSelect('schemeItemLink.scheme', 'scheme')
      .innerJoinAndSelect('schemeItemLink.item', 'item')
      .where('schemeItemLink.id = :id', { id })
      .getOne();
  }

  async create(
    schemeItemLinkCreateDto: SchemeItemLinkCreateDto,
  ): Promise<SchemeItemLink | null> {
    const id = await this.getMaxId();
    const [scheme, item] = await Promise.all([
      this.schemeService.findOne(schemeItemLinkCreateDto.idScheme),
      this.itemService.findOne(schemeItemLinkCreateDto.idItem),
    ]);
    if (scheme && item) {
      const schemeItemLink = new SchemeItemLink();
      schemeItemLink.id = id + 1;
      schemeItemLink.production = schemeItemLinkCreateDto.production;
      schemeItemLink.scheme = scheme;
      schemeItemLink.item = item;
      return this.schemeItemLinkRepo.save(schemeItemLink);
    } else {
      const errorStack: string[] = ['error: getting data from database'];
      if (scheme === null) {
        errorStack.push(
          `expected scheme by id = ${schemeItemLinkCreateDto.idScheme} but found null`,
        );
      }
      if (item === null) {
        errorStack.push(
          `expected item by id = ${schemeItemLinkCreateDto.idItem} but found null`,
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: errorStack.join('\n'),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: number,
    schemeItemLinkUpdateDto: SchemeItemLinkUpdateDto,
  ): Promise<SchemeItemLink | null> {
    const schemeItemLink = await this.findOne(id);
    if (schemeItemLink) {
      const scheme = schemeItemLinkUpdateDto.idScheme
        ? await this.schemeService.findOne(schemeItemLinkUpdateDto.idScheme)
        : schemeItemLink.scheme;
      const item = schemeItemLinkUpdateDto.idItem
        ? await this.itemService.findOne(schemeItemLinkUpdateDto.idItem)
        : schemeItemLink.item;
      if (scheme && item) {
        schemeItemLink.production =
          schemeItemLinkUpdateDto.production ?? schemeItemLink.production;
        schemeItemLink.scheme = scheme;
        schemeItemLink.item = item;
        return this.schemeItemLinkRepo.save(schemeItemLink);
      } else {
        const errorStack: string[] = ['error: getting data from database'];
        if (scheme === null) {
          errorStack.push(
            `expected scheme by id = ${schemeItemLinkUpdateDto.idScheme} but found null`,
          );
        }
        if (item === null) {
          errorStack.push(
            `expected item by id = ${schemeItemLinkUpdateDto.idItem} but found null`,
          );
        }
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: errorStack.join('\n'),
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `schemeItemLink not found by id = ${id}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async remove(id: number): Promise<void> {
    await this.schemeItemLinkRepo.delete(id);
  }
}
