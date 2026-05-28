import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const databaseConnection = (prefix = ""): Knex.MySqlConnectionConfig => {
  const envPrefix = prefix ? `${prefix}_` : "";

  return {
    host: process.env[`${envPrefix}DB_HOST`] ?? "localhost",
    port: Number(process.env[`${envPrefix}DB_PORT`] || 3306),
    user: process.env[`${envPrefix}DB_USER`] || "",
    password: process.env[`${envPrefix}DB_PASSWORD`] || "",
    database: process.env[`${envPrefix}DB_NAME`] || "",
  };
};

const mysqlConnection = (
  fallback: () => Knex.MySqlConnectionConfig,
): string | Knex.MySqlConnectionConfig => process.env.DATABASE_URL || fallback();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: databaseConnection(),
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
  },

  test: {
    client: "mysql2",
    connection: databaseConnection("TEST"),
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
  },
  production: {
    client: "mysql2",
    connection: mysqlConnection(() => databaseConnection()),
    migrations: {
      directory: "./dist/database/migrations",
      extension: "js",
      loadExtensions: [".js"],
    },
  },
};

export default config;
