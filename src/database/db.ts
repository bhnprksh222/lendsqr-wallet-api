import knex from "knex";
import config from "./knex";

const environment = process.env.NODE_ENV ?? "development";
const dbConfig = config[environment];

if (!dbConfig) {
  throw new Error(`No database configuration found for NODE_ENV=${environment}`);
}

const db = knex(dbConfig);

export default db;
