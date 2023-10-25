import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasMetadataOnTokenEntity1698247348898 implements MigrationInterface {
  name = 'AddHasMetadataOnTokenEntity1698247348898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" ADD "has_metadata" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`CREATE INDEX "IDX_50cb81c0b051c122c0d05786b0" ON "tokens" ("has_metadata") `);
    await queryRunner.query(`UPDATE tokens SET has_metadata = true WHERE metadata <> '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_50cb81c0b051c122c0d05786b0"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "has_metadata"`);
  }
}
