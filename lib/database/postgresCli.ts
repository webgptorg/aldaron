import { spawn } from 'node:child_process';

export type PostgresClientTool = 'pg_dump' | 'pg_restore';

export type PostgresCommandStandardOutputHandler = (standardOutputChunk: Buffer) => void;

export type PostgresCommandRunner = (
    command: string,
    argumentsList: readonly string[],
    handleStandardOutput?: PostgresCommandStandardOutputHandler,
) => Promise<void>;

export type CreatePostgresCommandRunnerOptions = {
    readonly operation: string;
    readonly tool: PostgresClientTool;
};

/**
 * Resolve the client executable from its cross-platform PostgreSQL name.
 */
export function createPostgresClientCommand(
    tool: PostgresClientTool,
    platform: NodeJS.Platform = process.platform,
): string {
    return platform === 'win32' ? `${tool}.exe` : tool;
}

/**
 * Give either archive command the same practical, platform-appropriate installation instructions.
 */
export function createPostgresClientInstallationInstructions(
    verificationTool: PostgresClientTool,
    platform: NodeJS.Platform = process.platform,
): string {
    const verification = `Then open a new terminal and verify the installation with \`${verificationTool} --version\`.`;

    if (platform === 'win32') {
        return [
            'Install the PostgreSQL command-line tools from https://www.postgresql.org/download/windows/.',
            'Add the installed PostgreSQL `bin` directory (for example, `C:\\Program Files\\PostgreSQL\\<version>\\bin`) to PATH.',
            verification,
        ].join('\n');
    }

    if (platform === 'darwin') {
        return [
            'With Homebrew, install the PostgreSQL client tools: `brew install libpq`.',
            'Add them to PATH: `echo \'export PATH="$(brew --prefix libpq)/bin:$PATH"\' >> ~/.zshrc`, then run `source ~/.zshrc`.',
            'Alternatively, use the installer at https://www.postgresql.org/download/macosx/.',
            verification,
        ].join('\n');
    }

    return [
        "Install the PostgreSQL client package with your Linux distribution's package manager.",
        'For Debian or Ubuntu, run `sudo apt install postgresql-client`.',
        'For other distributions, see https://www.postgresql.org/download/linux/.',
        verification,
    ].join('\n');
}

function createPostgresClientNotFoundError(options: CreatePostgresCommandRunnerOptions): Error {
    return new Error(
        `Cannot ${options.operation}: ${options.tool} was not found on PATH.\n${createPostgresClientInstallationInstructions(options.tool)}`,
    );
}

/**
 * Run one PostgreSQL archive utility while consistently reporting a missing client and a failed command.
 *
 * Successful standard output is discarded unless a caller streams it through a handler. This lets archive inspection
 * process large output without retaining it all in memory. Diagnostics stay on stderr, where PostgreSQL writes them.
 */
export function createPostgresCommandRunner(
    options: CreatePostgresCommandRunnerOptions,
): PostgresCommandRunner {
    return (command, argumentsList, handleStandardOutput) =>
        new Promise((resolve, reject) => {
            const standardOutput = handleStandardOutput === undefined ? 'ignore' : 'pipe';
            const childProcess = spawn(command, argumentsList, { stdio: ['ignore', standardOutput, 'inherit'] });
            let isSettled = false;

            if (handleStandardOutput !== undefined && childProcess.stdout !== null) {
                childProcess.stdout.on('data', handleStandardOutput);
            }

            childProcess.once('error', (error: NodeJS.ErrnoException) => {
                if (isSettled) return;
                isSettled = true;

                if (error.code === 'ENOENT') {
                    reject(createPostgresClientNotFoundError(options));
                    return;
                }

                reject(error);
            });

            childProcess.once('close', (exitCode, signal) => {
                if (isSettled) return;
                isSettled = true;

                if (exitCode === 0) {
                    resolve();
                    return;
                }

                if (signal !== null) {
                    reject(new Error(`${options.tool} was terminated by ${signal}.`));
                    return;
                }

                reject(new Error(`${options.tool} failed with exit code ${exitCode ?? 'unknown'}.`));
            });
        });
}
