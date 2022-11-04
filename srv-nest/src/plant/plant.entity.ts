import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Plant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
