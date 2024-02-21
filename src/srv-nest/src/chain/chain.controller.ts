import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ChainService } from './chain.service';
import { Chain } from './chain.entity';

@Controller('chain')
export class ChainController {
  constructor(private chainService: ChainService) {}

  @Get()
  findAll(): Promise<Chain[]> {
    return this.chainService.findAll();
  }

  @Get(':id')
  findOne(@Param() params): Promise<Chain | null> {
    return this.chainService.findOne(Number(params.id));
  }

  @Post()
  create(): Promise<Chain> {
    return this.chainService.create();
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.chainService.remove(Number(id));
  }
}
