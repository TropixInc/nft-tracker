import { ApiProperty } from '@nestjs/swagger';
import { EntityDtoMapper } from 'common/dtos/entity-dto-mapper.dto';
import { UUIDHelper } from 'common/helpers/uuid.helper';
import { ChainId } from 'src/common/enums';
import { SetOptional } from 'type-fest';
import { ContractEntity as Entity, ContractModel as Model } from '../entities/contracts.entity';

export class ContractDto extends EntityDtoMapper<Model, Entity> implements Model {
  @ApiProperty({ type: String })
  symbol: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  address: string;

  @ApiProperty({ type: Number })
  chainId: ChainId;

  @ApiProperty({ type: String })
  totalSupply: string;

  @ApiProperty({ type: Boolean })
  cacheMedia: boolean;

  constructor(attributes: Model) {
    super(attributes);
  }

  public create(dto: SetOptional<Model, 'id'>): Model {
    const id = dto.id || UUIDHelper.generate();
    return new ContractDto({
      ...dto,
      id,
    });
  }

  public toEntity(): Entity {
    const entity = new Entity();

    for (const prop in entity) {
      if (this[prop]) entity[prop] = this[prop];
    }

    return entity;
  }

  public toDto(): Entity {
    return this;
  }

  public static fromEntity(entity: Entity): ContractDto {
    const data: Entity = {
      ...entity,
    };
    return new ContractDto(data);
  }
}
