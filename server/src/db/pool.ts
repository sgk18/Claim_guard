import fs from "fs";
import pg from "pg";
import { Signer } from "@aws-sdk/rds-signer";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { config, DatabaseConfig } from "../config/index.js";

// DATE columns stay as "YYYY-MM-DD" strings, and NUMERIC columns come back as numbers.
pg.types.setTypeParser(1082, (v: string) => v);
pg.types.setTypeParser(1700, (v: string) => parseFloat(v));

function buildPasswordProvider(db: DatabaseConfig): string | (() => Promise<string>) {
  if (db.password) return db.password;
  const signer = new Signer({
    hostname: db.host,
    port: db.port,
    username: db.user,
    region: db.region,
    credentials: fromNodeProviderChain(),
  });
  // A fresh IAM token (valid 15 minutes) is requested for every new pooled connection.
  return () => signer.getAuthToken();
}

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (pool) return pool;
  const db = config.database;
  if (!db.enabled) throw new Error("Database is not configured (DB_HOST is not set)");

  // Always verify the server certificate. Express-configuration Aurora clusters use a public
  // Amazon Trust Services certificate that Node trusts by default; set DB_SSL_CA to a PEM file
  // to trust the RDS CA bundle for standard (non-express) clusters.
  const ssl: pg.PoolConfig["ssl"] = { rejectUnauthorized: true };
  if (db.sslCaPath) ssl.ca = fs.readFileSync(db.sslCaPath, "utf-8");

  pool = new pg.Pool({
    host: db.host,
    port: db.port,
    user: db.user,
    database: db.name,
    password: buildPasswordProvider(db),
    max: db.poolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: db.connectTimeoutMs,
    ssl,
    options: `-c search_path=${db.schema}`,
  });
  pool.on("error", (err) => console.error("[db] idle client error:", err.message));
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
