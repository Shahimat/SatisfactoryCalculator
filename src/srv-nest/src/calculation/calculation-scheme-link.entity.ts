import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Calculation } from './calculation.entity';
import { Scheme } from '../scheme/scheme.entity';

@Entity()
export class CalculationSchemeLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acceleration: number;

  @Column()
  num_factories: number;

  @ManyToOne(
    () => Calculation,
    (calculation) => calculation.calculationSchemeLinks,
  )
  calculation: Calculation;

  @ManyToOne(() => Scheme, (calculation) => calculation.calculationSchemeLinks)
  scheme: Scheme;
}
