/** @type {import('next').NextConfig} */
const debug = process.env.NODE_ENV !== "production";

const nextConfig = {
  output: "export",
  assetPrefix: !debug ? "/Algo_Front_end/" : "",
};

module.exports = nextConfig;
