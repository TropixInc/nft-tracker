import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateControllerOnTokenJobEntity1695135988319 implements MigrationInterface {
  name = 'AddDateControllerOnTokenJobEntity1695135988319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ADD "complete_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ADD "failed_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ADD "started_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens_jobs" DROP COLUMN "started_at"`);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" DROP COLUMN "failed_at"`);
    await queryRunner.query(`ALTER TABLE "tokens_jobs" DROP COLUMN "complete_at"`);
  }
}
