import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Note: The tests import the very same modules the application does, so they have to understand the `@/` alias of
 *       `tsconfig.json` as well.
 */
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
    test: {
        // Note: Only the tests of this project are run, not the ones which happen to lie in the working folders
        exclude: ['node_modules/**', '.next/**', '.tmp/**', 'out/**'],
    },
});
