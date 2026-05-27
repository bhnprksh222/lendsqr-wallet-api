import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("transactions"))) {
    return;
  }

  await knex.schema.alterTable("transactions", (table) => {
    table.dropUnique(["reference"]);
    table.index(["reference"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("transactions"))) {
    return;
  }

  await knex.schema.alterTable("transactions", (table) => {
    table.dropIndex(["reference"]);
    table.unique(["reference"]);
  });
}
