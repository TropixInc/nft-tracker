import { Column, Entity, Index } from 'typeorm';
import { TokenAsset } from '../interfaces';
import { BaseEntity } from 'database/base.entity';
import { Optional } from 'src/common/interfaces';
import { TokenAssetStatus } from '../enums';

@Entity({ name: 'tokens_assets' })
export class TokenAssetEntity extends BaseEntity implements TokenAsset {
  @Index()
  @Column({ nullable: false, type: 'text' })
  rawUrl: string;

  @Index({ unique: true })
  @Column({ nullable: false, type: 'text' })
  publicId: string;

  @Column({ nullable: true, type: 'text' })
  url?: Optional<string>;

  @Index()
  @Column({ nullable: false, type: 'enum', enum: TokenAssetStatus, default: TokenAssetStatus.Created })
  status: TokenAssetStatus;
}

export type TokenAssetModel = Omit<TokenAssetEntity, 'deletedAt'> & BaseEntity;
