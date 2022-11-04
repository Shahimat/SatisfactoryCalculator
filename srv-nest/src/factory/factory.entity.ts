import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Icon } from '../icon/icon.entity';

@Entity()
export class Factory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  consumption: number;

  @Column()
  isSchemeGeneration: boolean;

  @Column()
  isSchemeConsumption: boolean;

  @Column()
  isAcceleration: boolean;

  @Column()
  tier: number;

  @Column()
  inputSolid: number;

  @Column()
  inputLiquid: number;

  @Column()
  inputOther: number;

  @Column()
  outputSolid: number;

  @Column()
  outputLiquid: number;

  @Column()
  outputOther: number;

  @ManyToOne(() => Icon, (icon) => icon.factories)
  icon: Icon;
}
