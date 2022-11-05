import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CalculationGetAllDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public name: string;
}

export class CalculationCreateDto {
  @IsString()
  @IsNotEmpty()
  public category: string;
}

export class CalculationUpdateDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public name?: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public category?: string;
}
