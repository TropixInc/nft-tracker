import { Column, Entity, Index } from 'typeorm';
import { TokenJob } from '../interfaces';
import { BaseEntity } from 'database/base.entity';
import { ChainId } from 'src/common/enums';
import { lowercase } from 'src/modules/database/database.helpers';
import { Optional } from 'src/common/interfaces';
import { TokenJobStatus, TokenJobType } from '../enums';

@Entity({ name: 'tokens_jobs' })
export class TokenJobEntity extends BaseEntity implements TokenJob {
  @Index()
  @Column({ nullable: false, transformer: [lowercase] })
  address: string;

  @Index()
  @Column({ nullable: false, type: 'integer' })
  chainId: ChainId;

  @Index()
  @Column({ nullable: false, array: true, type: 'text' })
  tokensIds: string[];

  @Column({ nullable: true, type: 'text', array: true })
  tokensUris?: Optional<string[]>;

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
}

export type TokenJobModel = Omit<TokenJobEntity, 'deletedAt'> & BaseEntity;
