import { IsNotEmpty, IsString, IsBoolean, ValidateIf } from 'class-validator';

export class ItemCategoryCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsBoolean()
  @ValidateIf((object, value) => value !== undefined)
  public isInternalEnergy: boolean;
}

export class ItemCategoryUpdateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsBoolean()
  @ValidateIf((object, value) => value !== undefined)
  public isInternalEnergy: boolean;
}
