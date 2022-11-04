import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Calculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
