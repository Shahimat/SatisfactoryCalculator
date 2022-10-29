import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ItemCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
