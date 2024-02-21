import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Scheme } from '../scheme/scheme.entity';
import { Item } from '../item/item.entity';

@Entity()
export class SchemeItemLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  production: number;

  @ManyToOne(() => Scheme, (scheme) => scheme.schemeItemLinks)
  scheme: Scheme;

  @ManyToOne(() => Item, (item) => item.schemeItemLinks)
  item: Item;
}
