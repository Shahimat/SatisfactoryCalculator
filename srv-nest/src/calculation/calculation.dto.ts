import { IsNotEmpty, IsString } from 'class-validator';

export class CalculationCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class CalculationUpdateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
