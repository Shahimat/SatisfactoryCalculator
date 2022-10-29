import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Icon } from './Icon';

@Entity()
export class IconCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Icon, (icon) => icon.iconCategory)
  icons: Icon[];
}
