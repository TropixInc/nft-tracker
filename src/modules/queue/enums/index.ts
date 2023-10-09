export enum LocalQueueEnum {
  Webhook = 'webhook',
  TokenJob = 'tokenJob',
}

export enum QueueConfigEnum {
  Local = 'local',
}

export enum WebhookJobs {
  SyncWebhookFailed = 'syncWebhookFailed',
  RetryWebhook = 'retryWebhook',
}

export enum TokenJobJobs {
  ExecuteVerifyMint = 'executeVerifyMint',
  CheckJobFrozen = 'checkJobFrozen',
  ExecuteFetchMetadataByJob = 'executeFetchMetadataByJob',
  ExecuteRefreshTokenByJob = 'executeRefreshTokenByJob',
  ExecuteUploadAssetByJob = 'executeUploadAssetByJob',
  CreateFetchJobs = 'createFetchJobs',
  CreateFetchOwnerAddressJobs = 'createFetchOwnerAddressJobs',
  ExecuteFetchOwnerAddressByJob = 'executeFetchOwnerAddressByJob',
}
