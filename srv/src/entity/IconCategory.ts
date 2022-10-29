import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class IconCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
