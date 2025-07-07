/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    images: { unoptimized: true },
    devIndicators: false,
    allowedDevOrigins: ['*.macaly.dev', '*.macaly.app', '*.macaly-app.com', '*.macaly-user-data.dev'],
    // Removed 'output: export' to enable API routes
    trailingSlash: true,
    distDir: 'out',
};

module.exports = nextConfig;
