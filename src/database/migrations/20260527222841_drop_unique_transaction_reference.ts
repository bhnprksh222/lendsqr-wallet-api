import type { Knex } from "knex";

const ignoreMissingIndex = (error: unknown) => {
  if (
    error instanceof Error &&
    error.message.includes("check that column/key exists")
  ) {
    return;
  }

  throw error;
};

const ignoreDuplicateIndex = (error: unknown) => {
  if (
    error instanceof Error &&
    (error.message.includes("Duplicate key name") ||
      error.message.includes("already exists"))
  ) {
    return;
  }

  throw error;
};

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("transactions"))) {
    return;
  }

  await knex.schema
    .alterTable("transactions", (table) => {
      table.dropUnique(["reference"]);
    })
    .catch(ignoreMissingIndex);

  await knex.schema
    .alterTable("transactions", (table) => {
      table.index(["reference"]);
    })
    .catch(ignoreDuplicateIndex);
}

export async function down(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("transactions"))) {
    return;
  }

  await knex.schema
    .alterTable("transactions", (table) => {
      table.dropIndex(["reference"]);
    })
    .catch(ignoreMissingIndex);

  await knex.schema
    .alterTable("transactions", (table) => {
      table.unique(["reference"]);
    })
    .catch(ignoreDuplicateIndex);
}
