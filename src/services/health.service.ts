import db from "../database/db";

export const checkDatabaseReadiness = async () => {
  await db.raw("select 1 as ready");
};
