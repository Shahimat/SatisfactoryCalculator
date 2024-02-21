import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';

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

export class AddSchemesToCalculation {
  @IsNotEmpty()
  @IsNumber()
  public calculationId: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  public schemeIds: number[];
}

export class ChangeSchemesToTargetCalculation {
  @IsNotEmpty()
  @IsNumber()
  public calculationIdTarget: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  public schemeLinkIds: number[];
}
