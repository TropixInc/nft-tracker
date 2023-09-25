import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetTokenIdWithNotNull1695651993226 implements MigrationInterface {
  name = 'SetTokenIdWithNotNull1695651993226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_4ee033a729483cd638948aa3d9"`);
    await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "token_id" SET NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4ee033a729483cd638948aa3d9" ON "tokens" ("address", "token_id", "chain_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_4ee033a729483cd638948aa3d9"`);
    await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "token_id" DROP NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4ee033a729483cd638948aa3d9" ON "tokens" ("address", "chain_id", "token_id") `,
    );
  }
}
