import { IsNotEmpty, IsString } from 'class-validator';

export class IconCategoryCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class IconCategoryUpdateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
