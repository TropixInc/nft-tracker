import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDefaultTokensMetadata1698245256021 implements MigrationInterface {
  name = 'RemoveDefaultTokensMetadata1698245256021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "metadata" DROP DEFAULT`);
    await queryRunner.query(`UPDATE tokens SET metadata = null WHERE metadata = '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
  }
}
