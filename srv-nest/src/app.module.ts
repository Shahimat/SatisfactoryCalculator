import path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ItemTypeModule } from './item-type/item-type.module';
import { ItemCategoryModule } from './item-category/item-category.module';
import { IconCategoryModule } from './icon-category/icon-category.module';
import { IconModule } from './icon/icon.module';
import { ItemModule } from './item/item.module';
import { FactoryModule } from './factory/factory.module';
import { ChainModule } from './chain/chain.module';
import { PlantModule } from './plant/plant.module';
import { CalculationModule } from './calculation/calculation.module';
import { SchemeModule } from './scheme/scheme.module';

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
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets'),
      serveRoot: '/assets',
    }),
    ItemTypeModule,
    ItemCategoryModule,
    IconCategoryModule,
    IconModule,
    ItemModule,
    FactoryModule,
    ChainModule,
    PlantModule,
    CalculationModule,
    SchemeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
