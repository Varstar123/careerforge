import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin the workspace root so Next doesn't pick up an unrelated parent lockfile.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Tree-shake heavy barrel packages so routes only ship the icons/components
    // they actually use. lucide-react, recharts and date-fns are optimized by
    // Next by default; framer-motion (landing animations) is not, so add it.
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
