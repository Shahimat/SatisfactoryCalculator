import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SchemeItemLinkService } from './scheme-item-link.service';
import {
  SchemeItemLinkCreateDto,
  SchemeItemLinkUpdateDto,
} from './scheme-item-link.dto';
import { SchemeItemLink } from './scheme-item-link.entity';

@Controller('scheme-item-link')
export class SchemeItemLinkController {
  constructor(private schemeItemLinkService: SchemeItemLinkService) {}

  @Get()
  findAll(): Promise<SchemeItemLink[]> {
    return this.schemeItemLinkService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<SchemeItemLink | null> {
    return this.schemeItemLinkService.findOne(Number(params.id));
  }

  @Post()
  create(
    @Body() schemeItemLinkCreateDto: SchemeItemLinkCreateDto,
  ): Promise<SchemeItemLink | null> {
    return this.schemeItemLinkService.create(schemeItemLinkCreateDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() schemeItemLinkUpdateDto: SchemeItemLinkUpdateDto,
  ): Promise<SchemeItemLink | null> {
    return await this.schemeItemLinkService.update(
      Number(id),
      schemeItemLinkUpdateDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.schemeItemLinkService.remove(Number(id));
  }
}
