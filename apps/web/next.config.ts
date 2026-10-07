import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ["@redfacyt/shared"],
};

export default nextConfig;
