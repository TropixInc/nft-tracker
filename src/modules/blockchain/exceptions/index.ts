import { ChainId } from 'src/common/enums';

export class ChainIsNotSupportedException extends Error {
  constructor(chainId: ChainId) {
    super(`ChainId ${chainId} is not supported`);
  }
}
