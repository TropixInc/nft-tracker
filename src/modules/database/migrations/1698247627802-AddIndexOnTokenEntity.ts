import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexOnTokenEntity1698247627802 implements MigrationInterface {
  name = 'AddIndexOnTokenEntity1698247627802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_2d8a14b6e833815bff45c207dc" ON "tokens" ("has_metadata", "created_at") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_2d8a14b6e833815bff45c207dc"`);
  }
}
