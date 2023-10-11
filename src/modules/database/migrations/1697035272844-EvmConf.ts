import { MigrationInterface, QueryRunner } from 'typeorm';

export class EvmConf1697035272844 implements MigrationInterface {
  name = 'EvmConf1697035272844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "configurations"("id", "created_at", "updated_at", "deleted_at", "key", "value", "schema", "active") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
      [
        '9637c543-454b-4c61-846a-b66ee497063a',
        '2023-10-11T14:41:12.351Z',
        '2023-10-11T14:41:12.351Z',
        null,
        'EVM',
        '[{"chainId":1,"rpc":"","wss":""}]',
        '{"type":"array","items":{"type":"object","properties":{"chainId":{"type":"integer"},"rpc":{"type":"string"},"wss":{"type":"string"}},"required":["chainId","rpc","wss"]}}',
        true,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE from "configurations" WHERE id = '9637c543-454b-4c61-846a-b66ee497063a';`);
  }
}
