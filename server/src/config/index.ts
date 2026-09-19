export interface DatabaseConfig {
  enabled: boolean;
  host: string;
  port: number;
  user: string;
  name: string;
  schema: string;
  region: string;
  /** Static password. When empty, a short-lived IAM auth token is generated instead. */
  password: string;
  /** Path to the CA bundle used to verify the RDS/Aurora TLS certificate. */
  sslCaPath: string;
  poolMax: number;
  connectTimeoutMs: number;
}

export interface AppConfig {
  port: number;
  host: string;
  mockMode: boolean;
  awsRegion: string;
  s3Bucket: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  corsOrigin: string;
  database: DatabaseConfig;
}

const awsRegion = process.env.AWS_REGION || "ap-southeast-2";

export const config: AppConfig = {
  port: parseInt(process.env.PORT || "3001", 10),
  host: process.env.HOST || "0.0.0.0",
  mockMode: process.env.CLAIMGUARD_MOCK_MODE !== "false", // default true for dev
  awsRegion,
  s3Bucket: process.env.AWS_S3_BUCKET || "claimguard-receipts-prod",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-key",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  database: {
    // Postgres is used only when DB_HOST is set; otherwise the in-memory repositories are used.
    enabled: Boolean(process.env.DB_HOST),
    host: process.env.DB_HOST || "",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    name: process.env.DB_NAME || "postgres",
    schema: process.env.DB_SCHEMA || "app",
    region: process.env.DB_REGION || awsRegion,
    password: process.env.DB_PASSWORD || "",
    sslCaPath: process.env.DB_SSL_CA || "",
    poolMax: parseInt(process.env.DB_POOL_MAX || "10", 10),
    connectTimeoutMs: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || "20000", 10),
  },
};
