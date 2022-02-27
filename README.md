## Description

ref-token-server is the node.js version of [indexer-helper](https://github.com/ref-finance/indexer-helper)'s
implementation.

## Installation

set `Cfg.NETWORK_ID` with `TESTNET`|`DEVNET`|`MAINNET` in `config.ts`.

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
