import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Factory } from '../factory/factory.entity';
import { SchemeItemLink } from '../scheme-item-link/scheme-item-link.entity';
import { CalculationSchemeLink } from '../calculation/calculation-scheme-link.entity';

@Entity()
export class Scheme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  generation: number;

  @ManyToOne(() => Factory, (factory) => factory.schemes)
  factory: Factory;

  @OneToMany(() => SchemeItemLink, (schemeItemLink) => schemeItemLink.scheme)
  schemeItemLinks: SchemeItemLink[];

  @OneToMany(
    () => CalculationSchemeLink,
    (calculationSchemeLink) => calculationSchemeLink.scheme,
  )
  calculationSchemeLinks: CalculationSchemeLink[];
}
