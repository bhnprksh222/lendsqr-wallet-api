import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (value: string | undefined, name: string): string => {
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const mysqlConnection = (
  url: string | undefined,
  fallback: Knex.MySqlConnectionConfig,
): string | Knex.MySqlConnectionConfig => url || fallback;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: requiredEnv(process.env.DB_USER, "DB_USER"),
      password: requiredEnv(process.env.DB_PASSWORD, "DB_PASSWORD"),
      database: requiredEnv(process.env.DB_NAME, "DB_NAME"),
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
  },

  test: {
    client: "mysql2",
    connection: {
      host: process.env.TEST_DB_HOST ?? "localhost",
      port: Number(process.env.TEST_DB_PORT || 3306),
      user: requiredEnv(process.env.TEST_DB_USER, "TEST_DB_USER"),
      password: requiredEnv(process.env.TEST_DB_PASSWORD, "TEST_DB_PASSWORD"),
      database: requiredEnv(process.env.TEST_DB_NAME, "TEST_DB_NAME"),
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
  },
  production: {
    client: "mysql2",
    connection: mysqlConnection(process.env.DATABASE_URL, {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: requiredEnv(process.env.DB_USER, "DB_USER"),
      password: requiredEnv(process.env.DB_PASSWORD, "DB_PASSWORD"),
      database: requiredEnv(process.env.DB_NAME, "DB_NAME"),
    }),
    migrations: {
      directory: "./dist/database/migrations",
      extension: "js",
    },
  },
};

export default config;
