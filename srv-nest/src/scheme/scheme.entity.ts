import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Factory } from '../factory/factory.entity';

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
}
