import { TokenEntity } from '../entities/tokens.entity';
import { Nft } from '../interfaces';

export class NftsMapper {
  public static toPublic(token: TokenEntity): Nft {
    return {
      contract: {
        address: token.address,
      },
      contractMetadata: {
        name: token.name,
        symbol: token.contract?.symbol,
        totalSupply: token.contract?.totalSupply,
        tokenType: 'ERC721',
      },
      id: {
        tokenId: token.tokenId,
        tokenMetadata: {
          tokenType: 'ERC721',
        },
      },
      title: token.name,
      description: token.description,
      tokenUri: {
        raw: token.tokenUri,
        gateway: token.tokenUri,
      },
      media: [
        {
          raw: token.imageRawUrl,
          gateway: token.asset?.url,
        },
      ],
      metadata: token.metadata,
    };
  }

  public static toMap(tokens: TokenEntity[]): Nft[] {
    return tokens.map((token) => this.toPublic(token));
  }
}
