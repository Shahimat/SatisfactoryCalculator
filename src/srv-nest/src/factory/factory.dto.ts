import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  ValidateIf,
  Min,
  Max,
} from 'class-validator';

export class FactoryCreateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  public consumption: number;

  @IsBoolean()
  @IsNotEmpty()
  public isSchemeGeneration: boolean;

  @IsBoolean()
  @IsNotEmpty()
  public isSchemeConsumption: boolean;

  @IsBoolean()
  @IsNotEmpty()
  public isAcceleration: boolean;

  @IsNumber()
  @Min(0)
  @Max(8)
  @IsNotEmpty()
  public tier: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  public inputSolid: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  public inputLiquid: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsNotEmpty()
  public inputOther: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  public outputSolid: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  public outputLiquid: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsNotEmpty()
  public outputOther: number;

  @IsNumber()
  @IsNotEmpty()
  public idIcon: number;
}

export class FactoryUpdateDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public name: string;

  @IsNumber()
  @Min(0)
  @ValidateIf((object, value) => value !== undefined)
  public consumption: number;

  @IsBoolean()
  @ValidateIf((object, value) => value !== undefined)
  public isSchemeGeneration: boolean;

  @IsBoolean()
  @ValidateIf((object, value) => value !== undefined)
  public isSchemeConsumption: boolean;

  @IsBoolean()
  @ValidateIf((object, value) => value !== undefined)
  public isAcceleration: boolean;

  @IsNumber()
  @Min(0)
  @Max(4)
  @ValidateIf((object, value) => value !== undefined)
  public inputSolid: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @ValidateIf((object, value) => value !== undefined)
  public inputLiquid: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @ValidateIf((object, value) => value !== undefined)
  public inputOther: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @ValidateIf((object, value) => value !== undefined)
  public outputSolid: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @ValidateIf((object, value) => value !== undefined)
  public outputLiquid: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @ValidateIf((object, value) => value !== undefined)
  public outputOther: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  public idIcon: number;
}
