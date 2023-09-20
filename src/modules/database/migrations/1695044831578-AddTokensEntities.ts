import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokensEntities1695044831578 implements MigrationInterface {
  name = 'AddTokensEntities1695044831578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_jobs_status_enum" AS ENUM('created', 'started', 'completed', 'failed')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."tokens_jobs_type_enum" AS ENUM('verify_mint', 'fetch_metadata')`);
    await queryRunner.query(
      `CREATE TABLE "tokens_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "address" character varying NOT NULL, "chain_id" integer NOT NULL, "tokens_ids" text array NOT NULL, "tokens_uris" text array, "execute_at" TIMESTAMP WITH TIME ZONE, "status" "public"."tokens_jobs_status_enum" NOT NULL DEFAULT 'created', "type" "public"."tokens_jobs_type_enum" NOT NULL, CONSTRAINT "PK_d59942539562a3e376bbee9ff40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e65159b04d2a6c51cdca5aa8da" ON "tokens_jobs" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" text, "description" text, "address" character varying NOT NULL, "chain_id" integer NOT NULL, "token_id" character varying NOT NULL, "token_uri" text NOT NULL, "external_url" text, "image_raw_url" text, "image_gateway_url" text, "metadata" jsonb DEFAULT '{}', CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92d3e8c538a844ea1b14153fa4" ON "tokens" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4ee033a729483cd638948aa3d9" ON "tokens" ("address", "token_id", "chain_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_4ee033a729483cd638948aa3d9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_92d3e8c538a844ea1b14153fa4"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e65159b04d2a6c51cdca5aa8da"`);
    await queryRunner.query(`DROP TABLE "tokens_jobs"`);
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tokens_jobs_status_enum"`);
  }
}
