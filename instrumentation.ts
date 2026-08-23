export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    const { registerNodeInstrumentation } = require('./instrumentation.node');
    await registerNodeInstrumentation();
}
