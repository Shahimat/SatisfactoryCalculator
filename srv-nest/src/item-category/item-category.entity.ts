import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Item } from './Item';

@Entity()
export class ItemCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  isInternalEnergy: boolean;
}
