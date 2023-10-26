import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Token } from '../interfaces';
import { BaseEntity } from 'database/base.entity';
import { ChainId } from 'src/common/enums';
import { lowercase } from 'src/modules/database/database.helpers';
import { Optional } from 'src/common/interfaces';
import { ContractEntity } from 'src/modules/contracts/entities/contracts.entity';
import { TokenAssetEntity } from './tokens-assets.entity';

const DELETED_AT_IS_NULL = 'deleted_at IS NULL';
@Entity({ name: 'tokens' })
@Index('UNIQUE_TOKEN_ADDRESS_TOKEN_ID_CHAIN', ['address', 'tokenId', 'chainId'], { unique: true })
@Index(['lastOwnerAddressCheckAt', 'ownerAddress'], { where: DELETED_AT_IS_NULL, background: true })
@Index(['address', 'chainId'], { where: DELETED_AT_IS_NULL, background: true })
@Index(['hasMetadata', 'createdAt'], { where: DELETED_AT_IS_NULL, background: true })
export class TokenEntity extends BaseEntity implements Token {
  @Column({ nullable: true, type: 'text' })
  name?: Optional<string>;

  @Column({ nullable: true, type: 'text' })
  description?: Optional<string>;

  @Index()
  @Column({ nullable: false, transformer: [lowercase] })
  address: string;

  @Index()
  @Column({ nullable: false, type: 'integer' })
  chainId: ChainId;

  @Column({ nullable: false, type: 'bigint' })
  tokenId: string;

  @Column({ nullable: false, type: 'text' })
  tokenUri: string;

  @Column({ nullable: true, type: 'text' })
  externalUrl?: Optional<string>;

  @Column({ nullable: true, type: 'text' })
  imageRawUrl?: Optional<string>;

  @Column({ nullable: true, type: 'jsonb', default: null })
  metadata: Record<string, unknown> | null;

  @Index()
  @Column({ nullable: false, type: 'bool', default: false })
  hasMetadata: boolean;

  @Index()
  @Column({ nullable: true, type: 'text', transformer: [lowercase] })
  ownerAddress?: Optional<string>;

  @ManyToOne(() => ContractEntity)
  @JoinColumn([
    { name: 'address', referencedColumnName: 'address' },
    { name: 'chain_id', referencedColumnName: 'chainId' },
  ])
  contract?: Optional<ContractEntity>;

  @Index()
  @Column({ nullable: true, type: 'timestamptz' })
  lastOwnerAddressCheckAt?: Optional<Date>;

  @Index()
  @Column({ nullable: true, type: 'timestamptz' })
  lastOwnerAddressChangeAt?: Optional<Date>;

  @Index()
  @Column({ nullable: true, type: 'uuid' })
  assetId?: Optional<string>;

  @ManyToOne(() => TokenAssetEntity)
  @JoinColumn()
  asset?: Optional<TokenAssetEntity>;

  @Index()
  @Column({ nullable: false, type: 'bool', default: false })
  hasAsset: boolean;
}

export type TokenModel = Omit<TokenEntity, 'deletedAt'> & BaseEntity;
