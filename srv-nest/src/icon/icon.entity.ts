import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IconCategory } from '../icon-category/icon-category.entity';
// import { Item } from './Item';

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

  // @OneToMany(() => Item, (item) => item.icon)
  // items: Item[];
}
