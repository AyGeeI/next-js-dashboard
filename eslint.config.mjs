import nextConfig from "eslint-config-next";

export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "out",
      "next-env.d.ts",
      "**/*.config.js",
      "**/*.config.mjs",
    ],
  },
  ...nextConfig,
];
