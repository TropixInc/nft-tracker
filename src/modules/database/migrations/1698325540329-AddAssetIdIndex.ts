import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetIdIndex1698325540329 implements MigrationInterface {
  name = 'AddAssetIdIndex1698325540329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_5a8d4b73fb260591ada89e89f3" ON "tokens" ("asset_id") WHERE asset_id IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5a8d4b73fb260591ada89e89f3"`);
  }
}
