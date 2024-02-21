import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IconCategory } from '../icon-category/icon-category.entity';
import { Item } from '../item/item.entity';
import { Factory } from '../factory/factory.entity';

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

  @OneToMany(() => Factory, (factory) => factory.icon)
  factories: Factory[];
}
