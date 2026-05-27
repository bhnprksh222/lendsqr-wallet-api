import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("users"))) {
    await knex.schema.createTable("users", (table) => {
      table.uuid("id").primary();

      table.string("first_name").notNullable();
      table.string("last_name").notNullable();

      table.string("email").notNullable().unique();
      table.string("phone").notNullable().unique();

      table.string("bvn").nullable();
      table.string("password_hash").notNullable();

      table.timestamps(true, true);
    });
  }

  if (await knex.schema.hasTable("wallets")) {
    try {
      await knex.schema.alterTable("wallets", (table) => {
        table
          .foreign("user_id")
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
      });
    } catch {
      // Ignore duplicate-key errors when rerunning against existing schema.
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("wallets")) {
    await knex.schema.alterTable("wallets", (table) => {
      table.dropForeign(["user_id"]);
    });
  }

  await knex.schema.dropTableIfExists("users");
}
