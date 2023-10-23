import { BaseEntity } from 'database/base.entity';
import { lowercase } from 'database/database.helpers';
import { ChainId } from 'src/common/enums';
import { Optional } from 'src/common/interfaces';
import { ContractEntity } from 'src/modules/contracts/entities/contracts.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('tokens_transfer')
@Index(['address', 'tokenId', 'transactionHash', 'chainId', 'transactionIndex'], { unique: true })
export class TokenTransferEntity extends BaseEntity {
  @ManyToOne(() => ContractEntity)
  @JoinColumn([
    { name: 'address', referencedColumnName: 'address' },
    { name: 'chain_id', referencedColumnName: 'chainId' },
  ])
  contract?: Optional<ContractEntity>;

  @Index()
  @Column({ nullable: false, transformer: [lowercase] })
  address: string;

  @Index()
  @Column({ nullable: false, type: 'integer' })
  chainId: ChainId;

  @Index()
  @Column({
    type: 'text',
    nullable: false,
    transformer: [lowercase],
  })
  fromAddress: string;

  @Index()
  @Column({
    type: 'text',
    nullable: false,
    transformer: [lowercase],
  })
  toAddress: string;

  @Index()
  @Column({ type: 'bigint', nullable: false })
  tokenId: string;

  @Column({ type: 'integer', nullable: false })
  blockNumber: number;

  @Index()
  @Column({
    type: 'text',
    nullable: false,
    transformer: [lowercase],
  })
  transactionHash: string;

  @Column({ type: 'integer', nullable: false })
  transactionIndex: number;

  @Index()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  transferredAt: Date;
}
