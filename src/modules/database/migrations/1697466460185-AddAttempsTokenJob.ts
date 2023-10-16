import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttempsTokenJob1697466460185 implements MigrationInterface {
  name = 'AddAttempsTokenJob1697466460185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens_jobs" ADD "attempts" integer NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens_jobs" DROP COLUMN "attempts"`);
  }
}
