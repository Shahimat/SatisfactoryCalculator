import { IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';

export class SchemeItemLinkCreateDto {
  @IsNumber()
  @IsNotEmpty()
  public production: number;

  @IsNumber()
  @IsNotEmpty()
  public idScheme: number;

  @IsNumber()
  @IsNotEmpty()
  public idItem: number;
}

export class SchemeItemLinkUpdateDto {
  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public production?: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public idScheme?: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public idItem?: number;
}
