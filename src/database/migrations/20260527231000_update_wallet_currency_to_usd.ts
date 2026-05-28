import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("wallets"))) {
    return;
  }

  await knex("wallets").where({ currency: "NGN" }).update({ currency: "USD" });

  await knex.schema.alterTable("wallets", (table) => {
    table.string("currency").notNullable().defaultTo("USD").alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("wallets"))) {
    return;
  }

  await knex("wallets").where({ currency: "USD" }).update({ currency: "NGN" });

  await knex.schema.alterTable("wallets", (table) => {
    table.string("currency").notNullable().defaultTo("NGN").alter();
  });
}
