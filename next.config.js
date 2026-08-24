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
    serverExternalPackages: ['pg'],
    outputFileTracingIncludes: {
        '/*': ['./migrations/**/*.sql'],
    },
    devIndicators: false,
    async redirects() {
        return [
            {
                source: '/pavol/cs',
                destination: '/cs/pavol',
                permanent: true,
            },
            {
                source: '/pavol/en',
                destination: '/en/pavol',
                permanent: true,
            },
            {
                source: '/jirka',
                destination: 'https://www.linkedin.com/in/jirkajahn/',
                permanent: true,
            },
            {
                source: '/jiri',
                destination: 'https://www.linkedin.com/in/jirkajahn/',
                permanent: true,
            },
        ];
    },
    allowedDevOrigins: ['*.macaly.dev', '*.macaly.app', '*.macaly-app.com', '*.macaly-user-data.dev'],
    webpack: (config, { dev, isServer }) => {
        // Note: [📖] Allow books to be imported:
        config.module.rules.push({
            test: /\.book$/,
            use: 'raw-loader',
        });

        // Allow YAML files to be imported
        config.module.rules.push({
            test: /\.ya?ml$/,
            use: 'raw-loader',
        });

        // TODO: [🧵]

        return config;
    },
};

module.exports = nextConfig;
