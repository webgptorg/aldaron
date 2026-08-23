export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    const { registerNodeInstrumentation } = await import('./instrumentation.node');
    await registerNodeInstrumentation();
}
