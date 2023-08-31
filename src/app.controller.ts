import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'common/decorators/ispublic.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @IsPublic()
  @Get()
  getInfo() {
    return this.appService.getIndex();
  }

  @IsPublic()
  @Get('/info')
  info() {
    return this.appService.getInfo();
  }
}
