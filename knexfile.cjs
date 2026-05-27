require("dotenv").config();

/** @type {import('knex').Knex.Config} */
const shared = {
  client: "mysql2",
};

const mysqlConnection = (url, fallback) => url || fallback;

module.exports = {
  development: {
    ...shared,
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "",
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
  },
  test: {
    ...shared,
    connection: {
      host: process.env.TEST_DB_HOST || "localhost",
      port: Number(process.env.TEST_DB_PORT || 3306),
      user: process.env.TEST_DB_USER || "",
      password: process.env.TEST_DB_PASSWORD || "",
      database: process.env.TEST_DB_NAME || "",
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
  },
  production: {
    ...shared,
    connection: mysqlConnection(process.env.DATABASE_URL, {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "",
    }),
    migrations: {
      directory: "./dist/database/migrations",
      extension: "js",
    },
  },
};
