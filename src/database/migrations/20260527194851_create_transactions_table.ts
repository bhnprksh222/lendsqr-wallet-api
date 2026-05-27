import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("transactions")) {
    return;
  }

  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary();

    table.uuid("wallet_id").notNullable();

    table.enu("type", ["funding", "transfer", "withdrawal"]).notNullable();

    table
      .enu("status", ["pending", "successful", "failed"])
      .notNullable()
      .defaultTo("pending");

    table.decimal("amount", 14, 2).notNullable();

    table.string("reference").notNullable().unique();

    table.uuid("sender_wallet_id").nullable();
    table.uuid("receiver_wallet_id").nullable();

    table.json("metadata").nullable();

    table.timestamps(true, true);

    table
      .foreign("wallet_id")
      .references("id")
      .inTable("wallets")
      .onDelete("CASCADE");

    table
      .foreign("sender_wallet_id")
      .references("id")
      .inTable("wallets")
      .onDelete("SET NULL");

    table
      .foreign("receiver_wallet_id")
      .references("id")
      .inTable("wallets")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("transactions");
}
