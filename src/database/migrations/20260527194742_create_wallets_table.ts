import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("wallets")) {
    return;
  }

  await knex.schema.createTable("wallets", (table) => {
    table.uuid("id").primary();

    table.uuid("user_id").notNullable().unique();

    table.decimal("balance", 14, 2).notNullable().defaultTo(0.0);
    table.string("currency").notNullable().defaultTo("NGN");

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("wallets");
}
