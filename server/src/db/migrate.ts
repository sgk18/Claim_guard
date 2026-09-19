import fs from "fs";
import path from "path";
import { closePool, getPool } from "./pool.js";

// Applies server/db/schema.sql to the configured database. The script is idempotent.
const schemaPath = path.resolve(__dirname, "../../db/schema.sql");

async function main() {
  const sql = fs.readFileSync(schemaPath, "utf-8");
  const pool = getPool();
  await pool.query(sql); // simple-query protocol runs the whole multi-statement file
  const { rows } = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() ORDER BY 1"
  );
  console.log(`[db:migrate] schema applied. ${rows.length} tables:`, rows.map((r) => r.table_name).join(", "));
}

main()
  .catch((e) => {
    console.error("[db:migrate] failed:", e.message);
    process.exitCode = 1;
  })
  .finally(closePool);
