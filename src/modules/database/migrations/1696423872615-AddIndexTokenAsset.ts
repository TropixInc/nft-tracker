import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexTokenAsset1696423872615 implements MigrationInterface {
  name = 'AddIndexTokenAsset1696423872615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_833b37801b142cd8900dd321a5"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_833b37801b142cd8900dd321a5" ON "tokens_assets" ("public_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_833b37801b142cd8900dd321a5"`);
    await queryRunner.query(`CREATE INDEX "IDX_833b37801b142cd8900dd321a5" ON "tokens_assets" ("public_id") `);
  }
}
