import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTotalSupplyToNullable1694704273798 implements MigrationInterface {
  name = 'ChangeTotalSupplyToNullable1694704273798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "total_supply" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "total_supply" SET NOT NULL`);
  }
}
