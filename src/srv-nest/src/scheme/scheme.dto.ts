import { IsNotEmpty, IsString, IsNumber, ValidateIf } from 'class-validator';

export class SchemeCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public generation: number;

  @IsNumber()
  @IsNotEmpty()
  public idFactory: number;
}

export class SchemeUpdateDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public name?: string;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public generation: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public idFactory?: number;
}
