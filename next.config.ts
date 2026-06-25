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
    // Keep visited pages in the client Router Cache so navigating away and back
    // reuses the already-loaded page instead of re-fetching + showing skeletons.
    // (Default dynamic is 0s.) Mutations still call router.refresh() to update.
    staleTimes: {
      dynamic: 1800, // 30 min
      static: 1800,
    },
  },
};

export default nextConfig;
