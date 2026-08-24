export async function register(): Promise<void> {
    // Next.js invokes this hook in both Node.js and Edge runtimes. The runner uses node:fs and pg, so only load it in
    // the Node.js bundle.
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { registerNodeInstrumentation } = await import('./instrumentation.node');
        await registerNodeInstrumentation();
    }
}
