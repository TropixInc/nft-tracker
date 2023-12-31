export enum TokenJobStatus {
  Created = 'created',
  Started = 'started',
  Completed = 'completed',
  Failed = 'failed',
}

export enum TokenJobType {
  VerifyMint = 'verify_mint',
  FetchMetadata = 'fetch_metadata',
  FetchOwnerAddress = 'fetch_owner_address',
  UploadAsset = 'upload_asset',
  RefreshToken = 'refresh_token',
}

export enum TokenAssetStatus {
  Created = 'created',
  Uploading = 'uploading',
  Uploaded = 'uploaded',
  Failed = 'failed',
}
