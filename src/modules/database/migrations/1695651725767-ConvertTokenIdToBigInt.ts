import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTokenIdToBigInt1695651725767 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_4ee033a729483cd638948aa3d9"`);
    await queryRunner.query(`ALTER TABLE tokens ADD COLUMN token_id_new bigint`);
    await queryRunner.query(`UPDATE tokens SET token_id_new = CAST(token_id AS bigint)`);
    await queryRunner.query(`ALTER TABLE tokens RENAME COLUMN token_id TO token_id_old`);
    await queryRunner.query(`ALTER TABLE tokens RENAME COLUMN token_id_new TO token_id`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "token_id_old"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4ee033a729483cd638948aa3d9" ON "tokens" ("address", "token_id", "chain_id")`,
    );
  }

  public async down(): Promise<void> {}
}
