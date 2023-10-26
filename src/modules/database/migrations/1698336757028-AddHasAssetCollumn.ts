import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasAssetCollumn1698336757028 implements MigrationInterface {
  name = 'AddHasAssetCollumn1698336757028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5a8d4b73fb260591ada89e89f3"`);
    await queryRunner.query(`ALTER TABLE "tokens" ADD "has_asset" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`CREATE INDEX "IDX_c3371f9873d28d6f4c102ec267" ON "tokens" ("has_asset")`);
    await queryRunner.query(`UPDATE tokens SET has_asset = true WHERE asset_id IS NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_c3371f9873d28d6f4c102ec267"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "has_asset"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_5a8d4b73fb260591ada89e89f3" ON "tokens" ("asset_id") WHERE (asset_id IS NULL)`,
    );
  }
}
