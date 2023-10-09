import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenTypeOnTokenJobs1696515829028 implements MigrationInterface {
  name = 'AddRefreshTokenTypeOnTokenJobs1696515829028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."tokens_jobs_type_enum" RENAME TO "tokens_jobs_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_jobs_type_enum" AS ENUM('verify_mint', 'fetch_metadata', 'fetch_owner_address', 'upload_asset', 'refresh_token')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens_jobs" ALTER COLUMN "type" TYPE "public"."tokens_jobs_type_enum" USING "type"::"text"::"public"."tokens_jobs_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_jobs_type_enum_old" AS ENUM('verify_mint', 'fetch_metadata', 'fetch_owner_address', 'upload_asset')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens_jobs" ALTER COLUMN "type" TYPE "public"."tokens_jobs_type_enum_old" USING "type"::"text"::"public"."tokens_jobs_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."tokens_jobs_type_enum_old" RENAME TO "tokens_jobs_type_enum"`);
  }
}
