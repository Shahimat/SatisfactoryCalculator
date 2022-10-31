import path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ItemTypeModule } from './item-type/item-type.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.join('db', 'DB.sqlite'),
      synchronize: true,
      migrationsRun: false,
      subscribers: [],
      autoLoadEntities: true,
    }),
    ItemTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
