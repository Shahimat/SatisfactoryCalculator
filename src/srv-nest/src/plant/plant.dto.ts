import { IsNotEmpty, IsString } from 'class-validator';

export class PlantCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class PlantUpdateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
