import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenJobIndex1698242902306 implements MigrationInterface {
  name = 'AddTokenJobIndex1698242902306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_0c59ea42fdf93adf68e6c28bff" ON "tokens_jobs" ("type", "status", "execute_at") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_0c59ea42fdf93adf68e6c28bff"`);
  }
}
