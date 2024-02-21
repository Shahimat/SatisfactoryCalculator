import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CalculationCategory } from './calculation-category.entity';
import { CalculationLink } from './calculation-link.entity';
import { CalculationSchemeLink } from './calculation-scheme-link.entity';

@Entity()
export class Calculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(
    () => CalculationCategory,
    (calculationCategory) => calculationCategory.calculations,
  )
  calculationCategory: CalculationCategory;

  @OneToMany(
    () => CalculationLink,
    (calculationLink) => calculationLink.calculationAggregation,
  )
  calculationAggregationLinks: CalculationLink[];

  @OneToMany(
    () => CalculationLink,
    (calculationLink) => calculationLink.calculationLink,
  )
  calculationLinks: CalculationLink[];

  @OneToMany(
    () => CalculationSchemeLink,
    (calculation) => calculation.calculation,
  )
  calculationSchemeLinks: CalculationSchemeLink[];
}
