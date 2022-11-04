import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IconCategory } from '../icon-category/icon-category.entity';
import { Item } from '../item/item.entity';

@Entity()
export class Icon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  path: string;

  @ManyToOne(() => IconCategory, (iconCategory) => iconCategory.icons)
  iconCategory: IconCategory;

  @OneToMany(() => Item, (item) => item.icon)
  items: Item[];
}
