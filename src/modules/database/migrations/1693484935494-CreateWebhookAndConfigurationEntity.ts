import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookAndConfigurationEntity1693484935494 implements MigrationInterface {
  name = 'CreateWebhookAndConfigurationEntity1693484935494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "configurations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "key" text NOT NULL, "value" json, "schema" json NOT NULL DEFAULT '{}', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_3c658898252e3694655de8a07e7" UNIQUE ("key"), CONSTRAINT "PK_ef9fc29709cc5fc66610fc6a664" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7a634ce13d3400dbc5042440fe" ON "configurations" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_attempt" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "url" character varying NOT NULL, "headers" jsonb, "body" jsonb, "method" character varying NOT NULL, "timeout" numeric, "meta" jsonb, "code" numeric NOT NULL, "data" jsonb, "client_id" character varying, "retry" boolean, CONSTRAINT "PK_e4ff77b66cdd20591ba6189a1f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_377bce23ebb90c1ec30e039d0a" ON "webhook_attempt" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_377bce23ebb90c1ec30e039d0a"`);
    await queryRunner.query(`DROP TABLE "webhook_attempt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7a634ce13d3400dbc5042440fe"`);
    await queryRunner.query(`DROP TABLE "configurations"`);
  }
}
