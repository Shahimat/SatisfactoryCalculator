import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Item } from './Item';

@Entity()
export class ItemType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // @OneToMany(() => Item, (item) => item.itemType)
  // items: Item[];
}
