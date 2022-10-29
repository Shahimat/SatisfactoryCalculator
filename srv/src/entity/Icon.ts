import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IconCategory } from './IconCategory';

@Entity()
export class Icon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  path: string;

  @ManyToOne(() => IconCategory, (iconCategory) => iconCategory.icons)
  iconCategory: IconCategory;
}
