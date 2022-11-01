import { IsNotEmpty, IsString } from 'class-validator';

export class ItemTypeDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
