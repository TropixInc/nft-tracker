import { ConflictException, NotFoundException } from '@nestjs/common';

export class ContractAlreadyExistsException extends ConflictException {
  constructor(address: string, chainId: number) {
    super(`Contract with address ${address} and chainId ${chainId} already exists`);
  }
}

export class ContractNotFoundException extends NotFoundException {
  constructor(address: string, chainId: number) {
    super(`Contract with address ${address} and chainId ${chainId} not found`);
  }
}
