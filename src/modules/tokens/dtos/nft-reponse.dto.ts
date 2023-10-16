import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationBase } from 'src/common/dtos/pagination.dto';
import { Optional } from 'src/common/interfaces';
import { Nft, NftContract, NftContractMetadata, NftId, NftMedia, NftTokenUri } from '../interfaces';

export class NftContractResponseDto implements NftContract {
  @ApiProperty({ type: String })
  address: string;
}

export class NftContractMetadataResponseDto implements NftContractMetadata {
  @ApiPropertyOptional({ type: String, nullable: true })
  name?: Optional<string>;

  @ApiPropertyOptional({ type: String, nullable: true })
  symbol?: Optional<string>;

  @ApiPropertyOptional({ type: String, nullable: true })
  totalSupply?: Optional<string>;

  @ApiPropertyOptional({ type: String, nullable: true })
  tokenType?: Optional<string>;
}

export class TokenMetadataResponseDto {
  @ApiProperty({ type: String })
  tokenType: string;
}

export class NftIdResponseDto implements NftId {
  @ApiProperty({ type: String })
  tokenId: string;

  @ApiProperty({ type: TokenMetadataResponseDto })
  tokenMetadata: TokenMetadataResponseDto;
}

export class NftTokenUriResponseDto implements NftTokenUri {
  @ApiProperty({ type: String })
  raw: string;

  @ApiProperty({ type: String })
  gateway: string;
}

export class NftMediaResponseDto implements NftMedia {
  @ApiPropertyOptional({ type: String, nullable: true })
  raw?: Optional<string>;

  @ApiPropertyOptional({ type: String, nullable: true })
  gateway?: Optional<string>;
}

export class NftResponse implements Nft {
  @ApiProperty({ type: NftContractResponseDto })
  contract: NftContractResponseDto;

  @ApiProperty({ type: NftContractMetadataResponseDto })
  contractMetadata: NftContractMetadataResponseDto;

  @ApiProperty({ type: NftIdResponseDto })
  id: NftIdResponseDto;

  @ApiPropertyOptional({ type: String, nullable: true })
  title?: Optional<string>;

  @ApiPropertyOptional({ type: String, nullable: true })
  description?: Optional<string>;

  @ApiProperty({ type: NftTokenUriResponseDto })
  tokenUri: NftTokenUriResponseDto;

  @ApiProperty({ type: NftMediaResponseDto, isArray: true })
  media: NftMediaResponseDto[];

  @ApiPropertyOptional({ type: Object, nullable: true })
  metadata?: Optional<Record<string, unknown>>;
}

export class NftPaginateResponseDto extends PaginationBase {
  @ApiProperty({ type: NftResponse, isArray: true })
  items: NftResponse[];
}
