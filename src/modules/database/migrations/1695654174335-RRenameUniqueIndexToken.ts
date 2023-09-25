import { MigrationInterface, QueryRunner } from 'typeorm';

export class RRenameUniqueIndexToken1695654174335 implements MigrationInterface {
  name = 'RRenameUniqueIndexToken1695654174335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_4ee033a729483cd638948aa3d9"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UNIQUE_TOKEN_ADDRESS_TOKEN_ID_CHAIN" ON "tokens" ("address", "token_id", "chain_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UNIQUE_TOKEN_ADDRESS_TOKEN_ID_CHAIN"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4ee033a729483cd638948aa3d9" ON "tokens" ("address", "chain_id", "token_id") `,
    );
  }
}
