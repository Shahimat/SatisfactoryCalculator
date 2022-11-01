import { IsNotEmpty, IsString, IsNumber, ValidateIf } from 'class-validator';

export class IconCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public path: string;

  @IsNumber()
  @IsNotEmpty()
  public id_icon_category: number;
}

export class IconUpdateDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public name?: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public path?: string;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public id_icon_category?: number;
}
