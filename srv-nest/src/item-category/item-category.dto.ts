import { IsNotEmpty, IsString } from 'class-validator';

export class ItemCategoryCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class ItemCategoryUpdateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
