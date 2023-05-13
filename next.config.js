/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
    swcMinify: false,
    images: { domains: ['api.qrserver.com'] },
});

module.exports = nextConfig;
