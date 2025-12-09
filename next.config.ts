import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Use serverExternalPackages for native node modules
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
