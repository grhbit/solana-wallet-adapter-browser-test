/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: process.env.CI === "true" ? "/solana-wallet-adapter-browser-test" : "",
  assetPrefix: process.env.CI === "true" ? "/solana-wallet-adapter-browser-test/" : "",
};

export default nextConfig;
