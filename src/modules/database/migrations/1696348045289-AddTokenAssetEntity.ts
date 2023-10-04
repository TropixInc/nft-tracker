import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenAssetEntity1696348045289 implements MigrationInterface {
  name = 'AddTokenAssetEntity1696348045289';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "image_gateway_url" TO "asset_id"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_assets_status_enum" AS ENUM('created', 'uploading', 'uploaded', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "raw_url" text NOT NULL, "public_id" text NOT NULL, "url" text, "status" "public"."tokens_assets_status_enum" NOT NULL DEFAULT 'created', CONSTRAINT "PK_193e95ad179a0ca8406d7c14a96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_42df1f60cd9e61e198dca39a95" ON "tokens_assets" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_c18bfa6a32d6ea135a70aa70db" ON "tokens_assets" ("raw_url") `);
    await queryRunner.query(`CREATE INDEX "IDX_833b37801b142cd8900dd321a5" ON "tokens_assets" ("public_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_fe653dfd314a70728851c6440f" ON "tokens_assets" ("status") `);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ADD "asset_uri" text`);
    await queryRunner.query(`ALTER TYPE "public"."tokens_jobs_type_enum" RENAME TO "tokens_jobs_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_jobs_type_enum" AS ENUM('verify_mint', 'fetch_metadata', 'fetch_owner_address', 'upload_asset')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens_jobs" ALTER COLUMN "type" TYPE "public"."tokens_jobs_type_enum" USING "type"::"text"::"public"."tokens_jobs_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_type_enum_old"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "asset_id"`);
    await queryRunner.query(`ALTER TABLE "tokens" ADD "asset_id" uuid`);
    await queryRunner.query(`CREATE INDEX "IDX_f75e4ed198f5c654eac5e98e50" ON "tokens_jobs" ("asset_uri") `);
    await queryRunner.query(`CREATE INDEX "IDX_b81b5d1fb0318bc9ae63de60d0" ON "tokens" ("asset_id") `);
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_b81b5d1fb0318bc9ae63de60d0c" FOREIGN KEY ("asset_id") REFERENCES "tokens_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_b81b5d1fb0318bc9ae63de60d0c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b81b5d1fb0318bc9ae63de60d0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f75e4ed198f5c654eac5e98e50"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "asset_id"`);
    await queryRunner.query(`ALTER TABLE "tokens" ADD "asset_id" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_jobs_type_enum_old" AS ENUM('verify_mint', 'fetch_metadata', 'fetch_owner_address')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens_jobs" ALTER COLUMN "type" TYPE "public"."tokens_jobs_type_enum_old" USING "type"::"text"::"public"."tokens_jobs_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."tokens_jobs_type_enum_old" RENAME TO "tokens_jobs_type_enum"`);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" DROP COLUMN "asset_uri"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fe653dfd314a70728851c6440f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_833b37801b142cd8900dd321a5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c18bfa6a32d6ea135a70aa70db"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_42df1f60cd9e61e198dca39a95"`);
    await queryRunner.query(`DROP TABLE "tokens_assets"`);
    await queryRunner.query(`DROP TYPE "public"."tokens_assets_status_enum"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "asset_id" TO "image_gateway_url"`);
  }
}
