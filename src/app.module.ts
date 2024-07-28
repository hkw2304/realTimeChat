import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway, RoomGateway } from './app.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  // 게이트웨이는 모듈에 등록을해야 사용가능(의존성 주입)
  providers: [AppService, ChatGateway, RoomGateway],
})
export class AppModule {}
