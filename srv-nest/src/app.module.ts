import path from 'path';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemTypeController } from './item-type/item-type.controller';

import { User } from './user.model';
import { ItemTypesService } from './item-type/item-types.service';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: path.join('db', 'DB.sqlite'),
      autoLoadModels: true,
      synchronize: true,
      database: 'test',
      models: [User],
    }),
  ],
  controllers: [AppController, ItemTypeController],
  providers: [AppService, ItemTypesService],
})
export class AppModule {}
