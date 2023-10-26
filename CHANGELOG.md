# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.9](https://github.com/TropixInc/nft-tracker/compare/v0.0.8...v0.0.9) (2023-10-26)

### [0.0.8](https://github.com/TropixInc/nft-tracker/compare/v0.0.7...v0.0.8) (2023-10-25)


### Features

* creating structure to process logs ([8bb0284](https://github.com/TropixInc/nft-tracker/commit/8bb028413f9d754f26c382dfebdcb76ad37aae9e))
* **event:** save transfer event ([144b10c](https://github.com/TropixInc/nft-tracker/commit/144b10ca657f9bf3bbdf43bebbf9ec0da4afe54f))
* **events:** listening for new block events ([a9e778b](https://github.com/TropixInc/nft-tracker/commit/a9e778ba15a47620ea71d6c531044f44d2e021af))
* **events:** parsing ERC721 contract events of transfer ([3317619](https://github.com/TropixInc/nft-tracker/commit/3317619ffcf1dcc780ed4520abd11bdcb1e4ae21))
* **token:** creating the token when it has just been minted ([4991ae5](https://github.com/TropixInc/nft-tracker/commit/4991ae52c0cb95d85ddbf0de8c668ca7423967b8))
* **verify mint:** putting the bull in control of the next items to be verify at the mint ([93483d6](https://github.com/TropixInc/nft-tracker/commit/93483d62e4575927ceac94b2dabf350e1ed69c7a))


### Bug Fixes

* **health:** checking wss provider is ready ([d764ba6](https://github.com/TropixInc/nft-tracker/commit/d764ba6a29ac360c49073743f16a6e2f2453b799))
* **heath:** fixing check of queue ([68f0d4b](https://github.com/TropixInc/nft-tracker/commit/68f0d4bf38af504e0cddad6cb1daa33aa99772ba))
* **queue:** sync block ([7b726d1](https://github.com/TropixInc/nft-tracker/commit/7b726d16619660aa75158f1c1dfc34d62ec2f450))

### [0.0.7](https://github.com/TropixInc/nft-tracker/compare/v0.0.6...v0.0.7) (2023-10-17)


### Features

* **fetch metadata:** adding backoff when error is too many request ([#17](https://github.com/TropixInc/nft-tracker/issues/17)) ([a7a85c1](https://github.com/TropixInc/nft-tracker/commit/a7a85c1a23f33a5f51a512e733de726eae30fcb4))

### [0.0.6](https://github.com/TropixInc/nft-tracker/compare/v0.0.5...v0.0.6) (2023-10-16)


### Features

* **token:** adding swagger response ([06974a0](https://github.com/TropixInc/nft-tracker/commit/06974a03efd18734a7b73b3e5fd2e5d52b058f74))

### [0.0.5](https://github.com/TropixInc/nft-tracker/compare/v0.0.4...v0.0.5) (2023-10-13)


### Features

* **verify mint:** adding resync of mint check after one hour from last check ([094505f](https://github.com/TropixInc/nft-tracker/commit/094505f31717b9e1c38fee4b837b59bfa56cd91f))

### [0.0.4](https://github.com/TropixInc/nft-tracker/compare/v0.0.3...v0.0.4) (2023-10-13)


### Features

* updating ethers ([1eaba8c](https://github.com/TropixInc/nft-tracker/commit/1eaba8c3da113847d040c00d9fda5caf6189060c))

### [0.0.3](https://github.com/TropixInc/nft-tracker/compare/v0.0.2...v0.0.3) (2023-10-11)


### Features

* fetching the rpc connection urls from the configuration table ([71c6656](https://github.com/TropixInc/nft-tracker/commit/71c6656e3a9f5b10769521a4685fa6ef6d3e94c6))

### [0.0.2](https://github.com/TropixInc/nft-tracker/compare/v0.0.1...v0.0.2) (2023-10-11)


### Features

* **heath:** adding blockchain health ([b86d76d](https://github.com/TropixInc/nft-tracker/commit/b86d76d0f3de51288d4dc401cab246287cead4ea))

### 0.0.1 (2023-10-11)


### Features

* add apache 2.0 license ([88fdd30](https://github.com/TropixInc/nft-tracker/commit/88fdd308987d26d85895c543ae9763b22b332601))
* adding refresh token ([300efe8](https://github.com/TropixInc/nft-tracker/commit/300efe8a7f9de51c9bd93e76a601e94789853f61))
* **asset:** upload asset from token ([3d4edd5](https://github.com/TropixInc/nft-tracker/commit/3d4edd54b0b21570bb68c1c526da7f87f15f8c5e))
* **auth:** adding authentication key via API ([e51940f](https://github.com/TropixInc/nft-tracker/commit/e51940fd2a8090dce9c7931213cb3ce492d4053c))
* configuration repository ([c07de23](https://github.com/TropixInc/nft-tracker/commit/c07de237aa0afab035a710f4731a17af8d4892b8))
* **contract:** creating basic contract structure ([a096e36](https://github.com/TropixInc/nft-tracker/commit/a096e361b08ce5cb4b188277e570a5a9affeca5c))
* **contract:** starting blockchain structure ([e5510dc](https://github.com/TropixInc/nft-tracker/commit/e5510dc8bfcf6508d50b3022c78eb4e8514fe1c6))
* **contract:** sync total supply ([2ca856e](https://github.com/TropixInc/nft-tracker/commit/2ca856e3c7d557fc4294539815ff459db94f6b76))
* **contract:** updating total supply ([f09eee8](https://github.com/TropixInc/nft-tracker/commit/f09eee81dbfec391d63e66a86f974022eab9b0fd))
* **jobs:** using for key share mode to gets nexts jobs to execute ([4f0c564](https://github.com/TropixInc/nft-tracker/commit/4f0c5648d2a99409c218448cfd4c9f78d2e3e7e7))
* **metadata:** extracting metadada when token uri is json ([d1ab8d0](https://github.com/TropixInc/nft-tracker/commit/d1ab8d015f6a1110a0477638e3f118ebe621a953))
* **metadata:** sanitize uri ([18fe136](https://github.com/TropixInc/nft-tracker/commit/18fe136aa994d538df544b8610c74aed3163816a))
* **nft:** creating route to return metadata from a token ([1621133](https://github.com/TropixInc/nft-tracker/commit/1621133418b64c1d24ebc0bda964f7a35948ca85))
* **nfts:** checking owner address ([7898441](https://github.com/TropixInc/nft-tracker/commit/7898441b9830e60b7a7b2d1e4c77dace59a8a21a))
* **nfts:** creating the routes that return NFTs from a contract and by owner ([4904099](https://github.com/TropixInc/nft-tracker/commit/4904099ee3d0242b19824457eb0b9e9f7ea54588))
* **token:** fetch metadata ([4b2959b](https://github.com/TropixInc/nft-tracker/commit/4b2959bede1fd048f9d651a55b705f08c93135d9))
* **tokens:** importing the tokens of a contract ([38f8741](https://github.com/TropixInc/nft-tracker/commit/38f874135bc14b6565f4bf19e90aafb7e6bcf36a))
* **token:** using upsert when importing tokens ([28b343f](https://github.com/TropixInc/nft-tracker/commit/28b343f2cd95db61cfe70154418e2cf87222ea6a))
* updating project dependencies ([ab71735](https://github.com/TropixInc/nft-tracker/commit/ab717351696ca811d079b51111f7ff037bb277c7))
* updating project dependencies ([e0de6d3](https://github.com/TropixInc/nft-tracker/commit/e0de6d33f9795469b8695bfeaf5e52c5929bf56c))
* updating throttler config ([b8804b1](https://github.com/TropixInc/nft-tracker/commit/b8804b1100ca1cc66d13f381c64e638d64c06b97))


### Bug Fixes

* **asset:** only uploading asset with true cache media ([ea45268](https://github.com/TropixInc/nft-tracker/commit/ea45268c188e39d42b495f973823b2be04e0cf4c))
* checking uri is just hash and fix to ipfs uri ([053d00e](https://github.com/TropixInc/nft-tracker/commit/053d00ef6cba90369b715b411241ea83a77b8afb))
* sanitize uri ([e644b54](https://github.com/TropixInc/nft-tracker/commit/e644b541273a5a0a7cc3df3be14989212eb222bc))
* **swagger:** fixed swagger annotation for api key ([6ef758b](https://github.com/TropixInc/nft-tracker/commit/6ef758b2212224671269d6d8760b255205a4ba74))
* **token:** fixed gateway return for token uri ([c6e7bd0](https://github.com/TropixInc/nft-tracker/commit/c6e7bd043d48486d3734aa7cc39ba0e889abf812))
* **token:** only caching the image if it is active in the contract ([f8eddd3](https://github.com/TropixInc/nft-tracker/commit/f8eddd3d3e2a31d7f31044951a13d12ec702d095))
* **verify mint:** changing verification ([2afba78](https://github.com/TropixInc/nft-tracker/commit/2afba78efd0ae7c6b241c8954f07298ca7753070))

### 0.0.1 (2023-10-11)


### Features

* add apache 2.0 license ([88fdd30](https://github.com/TropixInc/nft-tracker/commit/88fdd308987d26d85895c543ae9763b22b332601))
* adding refresh token ([300efe8](https://github.com/TropixInc/nft-tracker/commit/300efe8a7f9de51c9bd93e76a601e94789853f61))
* **asset:** upload asset from token ([3d4edd5](https://github.com/TropixInc/nft-tracker/commit/3d4edd54b0b21570bb68c1c526da7f87f15f8c5e))
* **auth:** adding authentication key via API ([e51940f](https://github.com/TropixInc/nft-tracker/commit/e51940fd2a8090dce9c7931213cb3ce492d4053c))
* configuration repository ([c07de23](https://github.com/TropixInc/nft-tracker/commit/c07de237aa0afab035a710f4731a17af8d4892b8))
* **contract:** creating basic contract structure ([a096e36](https://github.com/TropixInc/nft-tracker/commit/a096e361b08ce5cb4b188277e570a5a9affeca5c))
* **contract:** starting blockchain structure ([e5510dc](https://github.com/TropixInc/nft-tracker/commit/e5510dc8bfcf6508d50b3022c78eb4e8514fe1c6))
* **contract:** sync total supply ([2ca856e](https://github.com/TropixInc/nft-tracker/commit/2ca856e3c7d557fc4294539815ff459db94f6b76))
* **contract:** updating total supply ([f09eee8](https://github.com/TropixInc/nft-tracker/commit/f09eee81dbfec391d63e66a86f974022eab9b0fd))
* **jobs:** using for key share mode to gets nexts jobs to execute ([4f0c564](https://github.com/TropixInc/nft-tracker/commit/4f0c5648d2a99409c218448cfd4c9f78d2e3e7e7))
* **metadata:** extracting metadada when token uri is json ([d1ab8d0](https://github.com/TropixInc/nft-tracker/commit/d1ab8d015f6a1110a0477638e3f118ebe621a953))
* **metadata:** sanitize uri ([18fe136](https://github.com/TropixInc/nft-tracker/commit/18fe136aa994d538df544b8610c74aed3163816a))
* **nft:** creating route to return metadata from a token ([1621133](https://github.com/TropixInc/nft-tracker/commit/1621133418b64c1d24ebc0bda964f7a35948ca85))
* **nfts:** checking owner address ([7898441](https://github.com/TropixInc/nft-tracker/commit/7898441b9830e60b7a7b2d1e4c77dace59a8a21a))
* **nfts:** creating the routes that return NFTs from a contract and by owner ([4904099](https://github.com/TropixInc/nft-tracker/commit/4904099ee3d0242b19824457eb0b9e9f7ea54588))
* **token:** fetch metadata ([4b2959b](https://github.com/TropixInc/nft-tracker/commit/4b2959bede1fd048f9d651a55b705f08c93135d9))
* **tokens:** importing the tokens of a contract ([38f8741](https://github.com/TropixInc/nft-tracker/commit/38f874135bc14b6565f4bf19e90aafb7e6bcf36a))
* **token:** using upsert when importing tokens ([28b343f](https://github.com/TropixInc/nft-tracker/commit/28b343f2cd95db61cfe70154418e2cf87222ea6a))
* updating project dependencies ([ab71735](https://github.com/TropixInc/nft-tracker/commit/ab717351696ca811d079b51111f7ff037bb277c7))
* updating project dependencies ([e0de6d3](https://github.com/TropixInc/nft-tracker/commit/e0de6d33f9795469b8695bfeaf5e52c5929bf56c))
* updating throttler config ([b8804b1](https://github.com/TropixInc/nft-tracker/commit/b8804b1100ca1cc66d13f381c64e638d64c06b97))


### Bug Fixes

* **asset:** only uploading asset with true cache media ([ea45268](https://github.com/TropixInc/nft-tracker/commit/ea45268c188e39d42b495f973823b2be04e0cf4c))
* checking uri is just hash and fix to ipfs uri ([053d00e](https://github.com/TropixInc/nft-tracker/commit/053d00ef6cba90369b715b411241ea83a77b8afb))
* sanitize uri ([e644b54](https://github.com/TropixInc/nft-tracker/commit/e644b541273a5a0a7cc3df3be14989212eb222bc))
* **swagger:** fixed swagger annotation for api key ([6ef758b](https://github.com/TropixInc/nft-tracker/commit/6ef758b2212224671269d6d8760b255205a4ba74))
* **token:** fixed gateway return for token uri ([c6e7bd0](https://github.com/TropixInc/nft-tracker/commit/c6e7bd043d48486d3734aa7cc39ba0e889abf812))
* **token:** only caching the image if it is active in the contract ([f8eddd3](https://github.com/TropixInc/nft-tracker/commit/f8eddd3d3e2a31d7f31044951a13d12ec702d095))
* **verify mint:** changing verification ([2afba78](https://github.com/TropixInc/nft-tracker/commit/2afba78efd0ae7c6b241c8954f07298ca7753070))
