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
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
    webpack: (config, { dev, isServer }) => {
        // Note: [📖] Allow books to be imported:
        config.module.rules.push({
            test: /\.book$/,
            use: 'raw-loader',
        });

        // TODO: [🧵]

        return config;
    },
};

module.exports = nextConfig;
