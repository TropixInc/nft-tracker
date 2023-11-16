import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetTokenJobOnTokenEntity1699877504461 implements MigrationInterface {
  name = 'AddAssetTokenJobOnTokenEntity1699877504461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" ADD "asset_token_job_id" uuid`);
    await queryRunner.query(`CREATE INDEX "IDX_ecd4c2a0bd9c0976592e247256" ON "tokens" ("asset_token_job_id") `);
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_ecd4c2a0bd9c0976592e2472563" FOREIGN KEY ("asset_token_job_id") REFERENCES "tokens_jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_ecd4c2a0bd9c0976592e2472563"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ecd4c2a0bd9c0976592e247256"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "asset_token_job_id"`);
  }
}
