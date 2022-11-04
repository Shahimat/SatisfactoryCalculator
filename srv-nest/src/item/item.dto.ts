import {
  IsNotEmpty,
  IsString,
  IsNumber,
  ValidateIf,
  Min,
} from 'class-validator';

export class ItemCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNumber()
  @Min(0)
  @ValidateIf((object, value) => value !== undefined)
  public energy?: number;

  @IsNumber()
  @IsNotEmpty()
  public idItemType: number;

  @IsNumber()
  @IsNotEmpty()
  public idItemCategory: number;

  @IsNumber()
  @IsNotEmpty()
  public idIcon: number;
}

export class ItemUpdateDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public name?: string;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public energy?: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public idItemType?: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public idItemCategory?: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public idIcon?: number;
}
