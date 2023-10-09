import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApiKeysConf1696853553311 implements MigrationInterface {
  name = 'ApiKeysConf1696853553311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "configurations"("id", "created_at", "updated_at", "deleted_at", "key", "value", "schema", "active") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
      [
        '5e723d4a-8cf6-44c0-a31c-84f495262283',
        '2023-10-09T12:12:32.776Z',
        '2023-10-09T12:12:32.776Z',
        null,
        'API_KEYS',
        '[{"value":"1","label":"1"}]',
        '{"type":"array","items":{"type":"object","properties":{"value":{"type":"string"},"label":{"type":"string"}},"required":["value","label"]}}',
        true,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE from "configurations" WHERE id = '5e723d4a-8cf6-44c0-a31c-84f495262283';`);
  }
}
