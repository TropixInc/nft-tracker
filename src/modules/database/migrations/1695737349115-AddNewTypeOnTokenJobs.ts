import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewTypeOnTokenJobs1695737349115 implements MigrationInterface {
  name = 'AddNewTypeOnTokenJobs1695737349115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" ADD "last_owner_address_check_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "tokens" ADD "last_owner_address_change_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TYPE "public"."tokens_jobs_type_enum" RENAME TO "tokens_jobs_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_jobs_type_enum" AS ENUM('verify_mint', 'fetch_metadata', 'fetch_owner_address')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens_jobs" ALTER COLUMN "type" TYPE "public"."tokens_jobs_type_enum" USING "type"::"text"::"public"."tokens_jobs_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_type_enum_old"`);
    await queryRunner.query(`CREATE INDEX "IDX_cdb95ba875fa7d66d81cb23ea6" ON "tokens" ("owner_address") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_a05879b143578c57005e1a6d25" ON "tokens" ("last_owner_address_check_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e66bfd6f541ee73e447b856e52" ON "tokens" ("last_owner_address_change_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_e66bfd6f541ee73e447b856e52"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a05879b143578c57005e1a6d25"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cdb95ba875fa7d66d81cb23ea6"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_jobs_type_enum_old" AS ENUM('verify_mint', 'fetch_metadata')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens_jobs" ALTER COLUMN "type" TYPE "public"."tokens_jobs_type_enum_old" USING "type"::"text"::"public"."tokens_jobs_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."tokens_jobs_type_enum_old" RENAME TO "tokens_jobs_type_enum"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "last_owner_address_change_at"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "last_owner_address_check_at"`);
  }
}
