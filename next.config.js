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
    webpack: (config, { dev, isServer, nextRuntime }) => {
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

        // The Edge instrumentation bundle is built even though the startup hook runs the database migration only in
        // Node.js. Keep this Node-only entry out of the Edge graph; the guarded require in instrumentation.ts is never
        // reached there, while the Node bundle still resolves and includes it normally.
        if (nextRuntime === 'edge') {
            config.externals.push(({ request }, callback) => {
                if (request === './instrumentation.node' || request?.endsWith('/instrumentation.node')) {
                    callback(null, 'commonjs ./instrumentation.node');
                    return;
                }

                callback();
            });
        }

        // TODO: [🧵]

        return config;
    },
};

module.exports = nextConfig;
