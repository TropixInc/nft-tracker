import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressAndChainIdWithNullable1696351177214 implements MigrationInterface {
  name = 'AddAddressAndChainIdWithNullable1696351177214';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ALTER COLUMN "address" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ALTER COLUMN "chain_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ALTER COLUMN "chain_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ALTER COLUMN "address" SET NOT NULL`);
  }
}
