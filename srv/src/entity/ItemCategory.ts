import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ItemCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
