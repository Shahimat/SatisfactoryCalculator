import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Calculation } from './calculation.entity';

@Entity()
export class CalculationCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => Calculation,
    (calculation) => calculation.calculationCategory,
  )
  calculations: Calculation[];
}
