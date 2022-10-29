import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CategoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
