import { Column, Entity, Index } from 'typeorm';
import { Token } from '../interfaces';
import { BaseEntity } from 'database/base.entity';
import { ChainId } from 'src/common/enums';
import { lowercase } from 'src/modules/database/database.helpers';
import { Optional } from 'src/common/interfaces';

@Entity({ name: 'tokens' })
@Index(['address', 'tokenId', 'chainId'], { unique: true })
export class TokenEntity extends BaseEntity implements Token {
  @Column({ nullable: true, type: 'text' })
  name?: Optional<string>;

  @Column({ nullable: true, type: 'text' })
  description?: Optional<string>;

  @Column({ nullable: false, transformer: [lowercase] })
  address: string;

  @Column({ nullable: false, type: 'integer' })
  chainId: ChainId;

  @Column({ nullable: false })
  tokenId: string;

  @Column({ nullable: false, type: 'text' })
  tokenUri: string;

  @Column({ nullable: true, type: 'text' })
  externalUrl?: Optional<string>;

  @Column({ nullable: true, type: 'text' })
  imageRawUrl?: Optional<string>;

  @Column({ nullable: true, type: 'text' })
  imageGatewayUrl?: Optional<string>;

  @Column({ nullable: true, type: 'jsonb', default: {} })
  metadata: Record<string, unknown> | null;
}

export type TokenModel = Omit<TokenEntity, 'deletedAt'> & BaseEntity;
