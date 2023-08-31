# NFT Tracker



## Setup .env

- Create a new .env file based on .env.example:

```bash
cp .env.example .env
```

## Installation

First, make sure you have Docker and Docker-Compose installed.

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
