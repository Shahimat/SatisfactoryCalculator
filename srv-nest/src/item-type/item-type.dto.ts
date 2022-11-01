import { IsNotEmpty, IsString } from 'class-validator';

export class ItemTypeCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class ItemTypeUpdateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
