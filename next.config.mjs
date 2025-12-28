/** @type {import('next').NextConfig} */

const nextConfig = {
  compiler: {
    // Remove all console logs
    removeConsole: false,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        fs: false, 
        crypto: false,
        ...config.resolve.fallback 
      };
    }
    return config;
  },
  images: {
    unoptimized: true, // Disable image optimization for Vercel free tier
    remotePatterns: [
            // IPFS Gateways (primary - most reliable)
            {
                protocol: "https",
                hostname: "cloudflare-ipfs.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ipfs.io",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "dweb.link",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "gateway.pinata.cloud",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "nftstorage.link",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "w3s.link",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ipfs.filebase.io",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "4everland.io",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "gateway.ipfs.io",
                pathname: "/**",
            },
            // IPFS Gateways (Tezos ecosystem)
            {
                protocol: "https",
                hostname: "ipfs.teia.cafe",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ipfs.fileship.xyz",
                pathname: "/**",
            },
            // NFT Marketplaces & CDNs
            {
                protocol: "https",
                hostname: "media.bootloader.art",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "assets.objkt.media",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "objkt.media",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.fxhash.xyz",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "gateway.fxhash2.xyz",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "hen.teztools.io",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "teia.art",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "versum.xyz",
                port: "",
                pathname: "/**",
            },
            // Arweave
            {
                protocol: "https",
                hostname: "arweave.net",
                port: "",
                pathname: "/**",
            },
            // Wildcard for any HTTPS image source (most permissive)
            {
                protocol: "https",
                hostname: "**",
                port: "",
                pathname: "/**",
            },
    ],
  },
};

export default nextConfig;
