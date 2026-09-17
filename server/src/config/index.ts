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
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || "3001", 10),
  host: process.env.HOST || "0.0.0.0",
  mockMode: process.env.CLAIMGUARD_MOCK_MODE !== "false", // default true for dev
  awsRegion: process.env.AWS_REGION || "ap-south-1",
  s3Bucket: process.env.AWS_S3_BUCKET || "claimguard-receipts-prod",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-key",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
