import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContractEntity1693928210110 implements MigrationInterface {
  name = 'AddContractEntity1693928210110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contracts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "symbol" character varying NOT NULL, "address" character varying NOT NULL, "chain_id" integer NOT NULL, "total_supply" character varying NOT NULL, "cache_media" boolean NOT NULL, CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7c3addba4fd7c997a9c444ab1b" ON "contracts" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_15f4a7b7cdf9edd7bbdc168cd5" ON "contracts" ("address", "chain_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_15f4a7b7cdf9edd7bbdc168cd5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7c3addba4fd7c997a9c444ab1b"`);
    await queryRunner.query(`DROP TABLE "contracts"`);
  }
}
