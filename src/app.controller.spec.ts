import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getAppConfig } from './config/app.config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        ConfigModule.forRoot({
          load: [getAppConfig],
        }),
      ],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // this is being super extra, in the case that you need multiple keys with the `get` method.
              if (key === 'name') {
                return 'sample-app';
              }
              if (key === 'version') {
                return '1.0.0';
              }

              return null;
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "test"', () => {
      expect(appController.getInfo().name).toEqual('sample-app');
      expect(appController.getInfo().version).toEqual('1.0.0');
    });
  });
});
