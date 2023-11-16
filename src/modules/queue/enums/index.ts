export enum LocalQueueEnum {
  Webhook = 'webhook',
  TokenJob = 'tokenJob',
  EvmEvents = 'evmEvents',
}

export enum QueueConfigEnum {
  Local = 'local',
}

export enum WebhookJobs {
  SyncWebhookFailed = 'syncWebhookFailed',
  RetryWebhook = 'retryWebhook',
}

export enum TokenJobJobs {
  CheckJobFrozen = 'checkJobFrozen',
  ExecuteFetchMetadataByJob = 'executeFetchMetadataByJob',
  ExecuteRefreshTokenByJob = 'executeRefreshTokenByJob',
  ExecuteUploadAssetByJob = 'executeUploadAssetByJob',
  ExecuteVerifyMintByJob = 'executeVerifyMintByJob',
  CreateVerifyMintJobs = 'createVerifyMintJobs',
  CreateFetchJobs = 'createFetchJobs',
  CreateFetchOwnerAddressJobs = 'createFetchOwnerAddressJobs',
  ExecuteFetchOwnerAddressByJob = 'executeFetchOwnerAddressByJob',
  SyncTotalSupply = 'syncTotalSupply',
  ResyncVerifyMint = 'resyncVerifyMint',
}

export enum EvmEventsJobs {
  SyncBlock = 'syncBlockJob',
}
