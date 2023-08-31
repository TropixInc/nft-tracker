import { Global, Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationEntity } from './entities/configuration.entity';

const entities = [TypeOrmModule.forFeature([ConfigurationEntity])];

@Global()
@Module({
  imports: [...entities],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [...entities, ConfigurationService],
})
export class ConfigurationModule {}
