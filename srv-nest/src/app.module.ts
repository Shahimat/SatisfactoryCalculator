import path from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ItemTypeModule } from './item-type/item-type.module';

@Module({
  imports: [
    // SequelizeModule.forRoot({
    //   dialect: 'sqlite',
    //   storage: path.join('db', 'DB.sqlite'),
    //   autoLoadModels: true,
    //   synchronize: true,
    //   database: 'test',
    //   models: [],
    // }),
    ItemTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
