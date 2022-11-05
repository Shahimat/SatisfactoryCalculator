import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ItemCategory } from '../item-category/item-category.entity';
import { ItemType } from '../item-type/item-type.entity';
import { Icon } from '../icon/icon.entity';
import { SchemeItemLink } from '../scheme-item-link/scheme-item-link.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  energy: number;

  @ManyToOne(() => ItemCategory, (itemCategory) => itemCategory.items)
  itemCategory: ItemCategory;

  @ManyToOne(() => ItemType, (itemType) => itemType.items)
  itemType: ItemType;

  @ManyToOne(() => Icon, (icon) => icon.items)
  icon: Icon;

  @OneToMany(() => SchemeItemLink, (schemeItemLink) => schemeItemLink.item)
  schemeItemLinks: SchemeItemLink[];
}
