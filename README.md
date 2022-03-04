## Ref Token Server

ref-token-server is the node.js version of [indexer-helper](https://github.com/ref-finance/indexer-helper)'s
implementation.

## Installation

1. Set `Cfg.NETWORK_ID` with `TESTNET`|`DEVNET`|`MAINNET` in `config.ts`.

2. Set `REDIS.HOST` and `REDIS.PORT`

3. Init dependencies
```bash
$ npm install
```

4. Running the app

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

Ref Token Server is [MIT licensed](LICENSE).
