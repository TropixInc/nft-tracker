import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenJobsIndexAddressAndChainId1698244423373 implements MigrationInterface {
  name = 'AddTokenJobsIndexAddressAndChainId1698244423373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_329f0a9540399e2fb930a06925" ON "tokens_jobs" ("address", "chain_id") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_329f0a9540399e2fb930a06925"`);
  }
}
