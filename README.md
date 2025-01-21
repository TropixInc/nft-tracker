# NFT Tracker

This application streamlines access to ERC-721 smart contracts' media and metadata directly from frontend applications, eliminating the need for third-party SaaS providers like Alchemy and Infura.

By adding a smart contract to the list of monitored contracts, this application retrieves and caches essential information, including metadata, token ownership data, and, optionally, the caching and transformation of video and image files. 

In our upcoming release, we will also introduce a feature that enables the fetching and caching of individual NFT transaction history for the monitored smart contracts, further enhancing the versatility and utility of this application.

# Setup

- Create a new .env file based on .env.example:

```bash
cp .env.example .env
```

### Chains

The project supports the following chains:

| Chain     | Id    |
|-----------|-------|
| Ethereum  | 1     |
| Polygon   | 137   |
| Mumbai    | 80001 |
| Moonbeam  | 1284  |
| Moonriver | 1285  |

To make these chains available in the environment, you need to enable them in the `CHAIN_IDS` environment variable, separated by commas. For example: `CHAIN_IDS=1,137,1284`.

The project uses public providers by default, but it's possible to use a paid provider. Just add the record to the `configurations` table under the `EVM` key. For example:

```sql
UPDATE public.configurations
SET value = '[{"chainId":137,"rpc":"","wss":""}]'
WHERE "key" = 'EVM';
```

### Cache Media

We utilize Cloudinary as a resource for caching NFT media. For contracts marked with `cacheMedia: true`, their media will be saved in Cloudinary.

To configure this, add your API keys to the `CLOUDINARY` environment variable.

We make use of Cloudinary's upload preset feature for configuration, which can be set up by following this tutorial: [Cloudinary Upload Presets](https://cloudinary.com/documentation/upload_presets ).


## Installation

First, ensure you have Docker and Docker-Compose installed.


```bash
# Start all services (database and redis)
npm run dc:up

# Start only database
npm run dc:up postgres

# Start only redis
npm run dc:up redis

# Install dependencies
npm install

# Run migrations
npm run typeorm:run

# Start the API
npm run start

# Start the API with watch mode
npm run start:dev
```

## Build
Every environment variable required to build should be added to `scripts/check-build-env.sh`

```console
$ docker build -t nft-tracker-api . 
$ docker run --env-file ./.env --rm -p 7002:7002 nft-tracker-api
```

# Endpoint

The project uses Swagger for documenting available endpoints. You can access it via the /docs path.

To access it, visit https://nft-tracker.w3block.io/docs 

## Acesso

Some routes require an access key. These access keys are registered in the configurations table under the `API_KEYS` key.

In Swagger, simply add the access key by clicking on "Authorize" and entering the key in the modal as shown below:

![Authorize](/docs/images/authorizations.png "Available authorizations")


If you're making a call via CURL or another method, you need to include the x-api-key header, as illustrated in the example below:

```console
curl -X 'POST' \
  'https://nft-tracker.w3block.io/contracts' \
  -H 'accept: application/json' \
  -H 'x-api-key: API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "0x0000000000000000000000000000000000000000",
  "chainId": "1",
  "cacheMedia": true
}'
```


# NFTs

The project monitors NFT contracts previously registered in /contracts.

After this registration, NFTs are available for querying through 3 endpoints, as shown in the figure below:


![NFTs](/docs/images/nfts.png "NFTs endpoints")


All three resources provide the same response format.






