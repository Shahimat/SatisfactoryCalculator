import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CalculationGetAllDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public name: string;
}

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
