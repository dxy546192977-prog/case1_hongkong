import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: path.join(__dirname),
  // 禁用 Turbopack，使用 Webpack 构建（规避中文路径下 Turbopack 的编码 panic）
  turbopack: undefined,
};

export default nextConfig;
