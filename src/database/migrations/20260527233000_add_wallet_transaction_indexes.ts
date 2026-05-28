import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("transactions")) {
    await knex.schema.alterTable("transactions", (table) => {
      table.index(["wallet_id", "created_at"]);
      table.index(["wallet_id", "type"]);
      table.index(["wallet_id", "status"]);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("transactions")) {
    await knex.schema.alterTable("transactions", (table) => {
      table.dropIndex(["wallet_id", "status"]);
      table.dropIndex(["wallet_id", "type"]);
      table.dropIndex(["wallet_id", "created_at"]);
    });
  }
}
