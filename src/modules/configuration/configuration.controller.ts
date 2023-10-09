import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HEADER_API_KEY } from '../auth/constants';
import { ConfigurationService } from './configuration.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@ApiBearerAuth(HEADER_API_KEY)
@UseGuards(AuthGuard('api-key'))
@ApiTags('App')
@Controller('configuration')
export class ConfigurationController {
  constructor(
    private readonly configService: ConfigService,
    private readonly configurationService: ConfigurationService,
  ) {}

  @Post()
  create(@Body() createConfigurationDto: CreateConfigurationDto) {
    // TODO: this endpoint should only be called during development
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new UnprocessableEntityException('This endpoint is only available in development mode');
    }
    return this.configurationService.create(createConfigurationDto);
  }

  @Get()
  findAll() {
    return this.configurationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configurationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfigurationDto: UpdateConfigurationDto) {
    return this.configurationService.update(id, updateConfigurationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configurationService.remove(id);
  }

  @Post('generate-types')
  generateTypes() {
    return this.configurationService.generateTypes();
  }
}
