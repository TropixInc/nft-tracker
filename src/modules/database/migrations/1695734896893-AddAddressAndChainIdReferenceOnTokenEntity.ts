import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressAndChainIdReferenceOnTokenEntity1695734896893 implements MigrationInterface {
  name = 'AddAddressAndChainIdReferenceOnTokenEntity1695734896893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_234cf91b074d8b361650ac45ae4" FOREIGN KEY ("address", "chain_id") REFERENCES "contracts"("address","chain_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_234cf91b074d8b361650ac45ae4"`);
  }
}
