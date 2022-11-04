import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chain {
  @PrimaryGeneratedColumn()
  id: number;
}
