import { MigrationInterface, QueryRunner } from 'typeorm';

export class EvmLogsConf1700662581056 implements MigrationInterface {
  name = 'EvmLogsConf1700662581056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "configurations"("id", "created_at", "updated_at", "deleted_at", "key", "value", "schema", "active") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
      [
        '25aaf552-8011-4041-9c01-a69029e5fa97',
        '2023-11-22T14:16:20.432Z',
        '2023-11-22T14:16:20.432Z',
        null,
        'EVM_LOGS',
        '[{"chainId":1285,"rpc":["https://moonriver.api.onfinality.io/public"],"wss":["wss://moonriver.publicnode.com"]}]',
        '{"type":"array","items":{"type":"object","properties":{"chainId":{"type":"integer"},"rpc":{"type":"array","items":{"type":"string"}},"wss":{"type":"array","items":{"type":"string"}}},"required":["chainId","rpc","wss"]}}',
        true,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE from "configurations" WHERE id = '25aaf552-8011-4041-9c01-a69029e5fa97';`);
  }
}
