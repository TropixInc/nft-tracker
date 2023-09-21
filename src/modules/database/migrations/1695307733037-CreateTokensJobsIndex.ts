import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTokensJobsIndex1695307733037 implements MigrationInterface {
  name = 'CreateTokensJobsIndex1695307733037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_322e5f50effa51ca1bec950382" ON "tokens_jobs" ("address") `);
    await queryRunner.query(`CREATE INDEX "IDX_de10a773974dc24d757037af54" ON "tokens_jobs" ("chain_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_859e0bf0f7ceeb003a57936a0b" ON "tokens_jobs" ("tokens_ids") `);
    await queryRunner.query(`CREATE INDEX "IDX_411a3bb44d905bf6bc0cddedda" ON "tokens_jobs" ("status") `);
    await queryRunner.query(`CREATE INDEX "IDX_361720e9bd43933c0fb927a7c7" ON "tokens_jobs" ("type") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_361720e9bd43933c0fb927a7c7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_411a3bb44d905bf6bc0cddedda"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_859e0bf0f7ceeb003a57936a0b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_de10a773974dc24d757037af54"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_322e5f50effa51ca1bec950382"`);
  }
}
