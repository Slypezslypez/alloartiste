/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" } // photos servies depuis votre bucket S3 / R2
    ]
  }
};

module.exports = nextConfig;
