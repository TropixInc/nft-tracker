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
  ExecuteFetchMetadata = 'executeFetchMetadata',
  CreateFetchMetadataJobs = 'createFetchMetadataJobs',
  CreateFetchOwnerAddressJobs = 'createFetchOwnerAddressJobs',
  ExecuteFetchOwnerAddress = 'executeFetchOwnerAddress',
}
