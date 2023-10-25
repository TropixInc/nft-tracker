import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokensIndex1698243298307 implements MigrationInterface {
  name = 'AddTokensIndex1698243298307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_62ccb4a646b93df3066fa393fb" ON "tokens" ("last_owner_address_check_at", "owner_address") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_62ccb4a646b93df3066fa393fb"`);
  }
}
