import { MigrationInterface, QueryRunner } from 'typeorm';

export class EvmSampleConf1697634294652 implements MigrationInterface {
  name = 'EvmSampleConf1697634294652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` UPDATE public.configurations
        SET schema = '{"type":"array","items":{"type":"object","properties":{"chainId":{"type":"integer"},"rpc":{"type":"string"},"wss":{"type":"string"},"confirmation":{"type":"integer", "nullable": true}},"required":["chainId","rpc","wss"]}}'
        WHERE id = '9637c543-454b-4c61-846a-b66ee497063a';
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` UPDATE public.configurations
        SET schema = '{"type":"array","items":{"type":"object","properties":{"chainId":{"type":"integer"},"rpc":{"type":"string"},"wss":{"type":"string"}},"required":["chainId","rpc","wss"]}}'
        WHERE id = '9637c543-454b-4c61-846a-b66ee497063a';
      `,
    );
  }
}
