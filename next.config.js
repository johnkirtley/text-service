/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: false,
    images: { domains: ['api.qrserver.com'] },
};

module.exports = nextConfig;
