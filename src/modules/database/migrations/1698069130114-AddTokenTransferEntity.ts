import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenTransferEntity1698069130114 implements MigrationInterface {
  name = 'AddTokenTransferEntity1698069130114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tokens_transfer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "address" character varying NOT NULL, "chain_id" integer NOT NULL, "from_address" text NOT NULL, "to_address" text NOT NULL, "token_id" bigint NOT NULL, "block_number" integer NOT NULL, "transaction_hash" text NOT NULL, "transaction_index" integer NOT NULL, "transferred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5e959005d89b51e90a758733c14" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eeb89986829fbf1e2dad72b7ac" ON "tokens_transfer" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_2b2481871f767a969ef68e9c21" ON "tokens_transfer" ("address") `);
    await queryRunner.query(`CREATE INDEX "IDX_f1606e501dba03db7a8acee5f2" ON "tokens_transfer" ("chain_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_c9c59bbc4df78da0e86e616e6b" ON "tokens_transfer" ("from_address") `);
    await queryRunner.query(`CREATE INDEX "IDX_6b441b9ef7a71690bcbe87c1a0" ON "tokens_transfer" ("to_address") `);
    await queryRunner.query(`CREATE INDEX "IDX_db33bd4c8892710766737fc60b" ON "tokens_transfer" ("token_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_0da7bb0a4f8a588a09de17f241" ON "tokens_transfer" ("transaction_hash") `);
    await queryRunner.query(`CREATE INDEX "IDX_bb423ff7007548f19e8b8e1425" ON "tokens_transfer" ("transferred_at") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_471ef610f86a89a58877f18543" ON "tokens_transfer" ("address", "token_id", "transaction_hash", "chain_id", "transaction_index") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_8887c0fb937bc0e9dc36cb62f3" ON "tokens" ("address") `);
    await queryRunner.query(`CREATE INDEX "IDX_146682b87089cb89412039459b" ON "tokens" ("chain_id") `);
    await queryRunner.query(
      `ALTER TABLE "tokens_transfer" ADD CONSTRAINT "FK_169352297cf2ad34feccf8969e3" FOREIGN KEY ("address", "chain_id") REFERENCES "contracts"("address","chain_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens_transfer" DROP CONSTRAINT "FK_169352297cf2ad34feccf8969e3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_146682b87089cb89412039459b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8887c0fb937bc0e9dc36cb62f3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_471ef610f86a89a58877f18543"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bb423ff7007548f19e8b8e1425"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0da7bb0a4f8a588a09de17f241"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_db33bd4c8892710766737fc60b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6b441b9ef7a71690bcbe87c1a0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c9c59bbc4df78da0e86e616e6b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f1606e501dba03db7a8acee5f2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2b2481871f767a969ef68e9c21"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_eeb89986829fbf1e2dad72b7ac"`);
    await queryRunner.query(`DROP TABLE "tokens_transfer"`);
  }
}
