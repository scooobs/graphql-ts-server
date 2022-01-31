# graphql-ts-server
This is a GraphQL Typescript boilerplate based off @`BenAwad`'s implementation found [here](https://github.com/benawad/graphql-ts-server-boilerplate).

## How to get started
1. Clone this repo.
2. Install dependencies.
3. Update `ormconfig.json` to your liking.
4. Create the databases and users specified in `ormconfig.json` in `psql`.
5. Start up redis.
6. `yarn start`.

## Commands
### start
Start the server.
### test
Run the tests (currently run sequentially).
### generate
Generate the types for your `schema.graphql` files (found at `/src/modules/*/schemal.graphql`).

## Troubleshooting
### QueryFailedError: function uuid_generate_v4() does not exist.
<b>Solution:</b> Connect to your `psql` database using `\c {db-name}` and check whether you have extensions installed using `\df`. If not, run `CREATE EXTENSION "uuid-ossp";`, if you do run `DROP EXTENSION "uuid-ossp";` and then `CREATE EXTENSION "uuid-ossp";`.
