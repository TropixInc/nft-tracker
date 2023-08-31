import { EntityManager, QueryRunner } from 'typeorm';

export async function runTransaction<R>(
  manager: EntityManager,
  callback: (queryRunner: QueryRunner) => Promise<R>,
  queryRunnerArg?: QueryRunner,
) {
  const queryRunner = queryRunnerArg || manager.connection.createQueryRunner();
  const isTransactionOwner = !queryRunner.isTransactionActive;
  if (isTransactionOwner) {
    await queryRunner.connect();
    await queryRunner.startTransaction();
  }
  try {
    const result = await callback(queryRunner);
    if (isTransactionOwner) await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    if (isTransactionOwner) await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    if (isTransactionOwner) await queryRunner.release();
  }
}
