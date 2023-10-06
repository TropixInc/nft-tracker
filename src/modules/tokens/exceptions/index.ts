import { NotFoundException } from '@nestjs/common';

export class TokenNotFoundException extends NotFoundException {
  constructor(address: string, chainId: number, tokenId: string) {
    super(`Token with address ${address}, chainId ${chainId} and tokenId ${tokenId} not found`);
  }
}
