import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Calculation } from './calculation.entity';

@Entity()
export class CalculationLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  num_calculations: number;

  @ManyToOne(
    () => Calculation,
    (calculation) => calculation.calculationAggregationLinks,
  )
  calculationAggregation: Calculation;

  @ManyToOne(() => Calculation, (calculation) => calculation.calculationLinks)
  calculationLink: Calculation;
}
