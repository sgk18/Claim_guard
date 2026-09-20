import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

try {
  fs.mkdirSync(path.join(process.cwd(), ".next", "standalone", ".next"), { recursive: true });
} catch {
  // directory creation fallback
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
