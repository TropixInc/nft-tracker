import { Column, Entity, Index } from 'typeorm';
import { TokenJob } from '../interfaces';
import { BaseEntity } from 'database/base.entity';
import { ChainId } from 'src/common/enums';
import { lowercase } from 'src/modules/database/database.helpers';
import { Optional } from 'src/common/interfaces';
import { TokenJobStatus, TokenJobType } from '../enums';

@Entity({ name: 'tokens_jobs' })
@Index(['type', 'status', 'executeAt'], { where: 'deleted_at IS NULL', background: true })
@Index(['address', 'chainId'], { where: 'deleted_at IS NULL', background: true })
export class TokenJobEntity extends BaseEntity implements TokenJob {
  @Index()
  @Column({ nullable: true, transformer: [lowercase], type: 'varchar' })
  address?: Optional<string>;

  @Index()
  @Column({ nullable: true, type: 'integer' })
  chainId?: Optional<ChainId>;

  @Index()
  @Column({ nullable: false, array: true, type: 'text' })
  tokensIds: string[];

  @Column({ nullable: true, type: 'text', array: true })
  tokensUris?: Optional<string[]>;

  @Index()
  @Column({ nullable: true, type: 'text' })
  assetUri?: Optional<string>;

  @Column({ nullable: true, type: 'timestamptz' })
  executeAt?: Optional<Date>;

  @Column({ nullable: true, type: 'timestamptz' })
  completeAt?: Optional<Date>;

  @Column({ nullable: true, type: 'timestamptz' })
  failedAt?: Optional<Date>;

  @Column({ nullable: true, type: 'timestamptz' })
  startedAt?: Optional<Date>;

  @Index()
  @Column({ nullable: false, type: 'enum', enum: TokenJobStatus, default: TokenJobStatus.Created })
  status: TokenJobStatus;

  @Index()
  @Column({ nullable: false, type: 'enum', enum: TokenJobType })
  type: TokenJobType;

  @Column({ nullable: false, default: 0, type: 'integer' })
  attempts: number;
}

export type TokenJobModel = Omit<TokenJobEntity, 'deletedAt'> & BaseEntity;
