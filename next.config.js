/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
    },
    // Allow Auth.js to work with Next.js 15
    serverExternalPackages: ["@elysiajs/eden"],
};

module.exports = nextConfig;
