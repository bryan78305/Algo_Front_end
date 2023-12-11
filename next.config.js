/** @type {import('next').NextConfig} */
const debug = process.env.NODE_ENV !== "production";

const nextConfig = {
  output: "export",
  assetPrefix: !debug ? "/crypto-algo-frontend/" : "",
};

module.exports = nextConfig;
