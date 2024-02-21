import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Item } from '../item/item.entity';

@Entity()
export class ItemCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  isInternalEnergy: boolean;

  @OneToMany(() => Item, (item) => item.itemCategory)
  items: Item[];
}
