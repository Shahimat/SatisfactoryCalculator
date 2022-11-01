import path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ItemTypeModule } from './item-type/item-type.module';
import { ItemCategoryModule } from './item-category/item-category.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.join('db', 'DB.sqlite'),
      synchronize: true,
      migrationsRun: false,
      entities: ['/build/**/*.entity.js'],
      migrations: ['/build/migrations/*.js'],
      subscribers: [],
      autoLoadEntities: true,
    }),
    ItemTypeModule,
    ItemCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
