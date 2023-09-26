import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerAddressTokenEntity1695736702653 implements MigrationInterface {
  name = 'AddOwnerAddressTokenEntity1695736702653';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" ADD "owner_address" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "owner_address"`);
  }
}
