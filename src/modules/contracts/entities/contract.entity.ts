import { Column, Entity, Index } from 'typeorm';
import { Contract } from '../interfaces';
import { BaseEntity } from 'database/base.entity';
import { ChainId } from 'src/common/enums';
import { lowercase } from 'src/modules/database/database.helpers';
import { Optional } from 'src/common/interfaces';

@Entity({ name: 'contracts' })
@Index(['address', 'chainId'], { unique: true })
export class ContractEntity extends BaseEntity implements Contract {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  symbol: string;

  @Column({ nullable: false, transformer: [lowercase] })
  address: string;

  @Column({ nullable: false, type: 'integer' })
  chainId: ChainId;

  @Column({ nullable: true, type: 'varchar' })
  totalSupply?: Optional<string>;

  @Column({ nullable: false })
  cacheMedia: boolean;
}

/**
 * Must extract the interface from the entity because extending directly from the entity could add extra properties
 */
export type ContractModel = Omit<ContractEntity, 'deletedAt'> & BaseEntity;
