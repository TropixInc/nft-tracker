import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenIndexAddressAndChainId1698244322611 implements MigrationInterface {
  name = 'AddTokenIndexAddressAndChainId1698244322611';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_48c23ee356fbf2f2f82f52ec91" ON "tokens" ("address", "chain_id") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_48c23ee356fbf2f2f82f52ec91"`);
  }
}
