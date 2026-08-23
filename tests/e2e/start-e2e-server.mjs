import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(
    await readFile(resolve(rootDirectory, 'tests/e2e/support/workshop-fixture.json'), 'utf8'),
);
const supabasePort = 54321;
const nextPort = 4009;

const workshopRows = [fixture.workshop, fixture.community];
const participantRows = new Map();

function sendJson(response, statusCode, body) {
    const responseBody = JSON.stringify(body);
    response.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(responseBody),
    });
    response.end(responseBody);
}

function readRequestBody(request) {
    return new Promise((resolveBody, rejectBody) => {
        const chunks = [];
        request.on('data', (chunk) => chunks.push(chunk));
        request.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            if (!text) {
                resolveBody({});
                return;
            }

            try {
                resolveBody(JSON.parse(text));
            } catch (error) {
                rejectBody(error);
            }
        });
        request.on('error', rejectBody);
    });
}

function selectWorkshopRows(searchParameters) {
    const slugFilter = searchParameters.get('slug');
    const roomKindFilter = searchParameters.get('room_kind');

    if (slugFilter?.startsWith('eq.')) {
        return workshopRows.filter((row) => row.slug === slugFilter.slice(3));
    }

    if (roomKindFilter === 'eq.community') {
        return [fixture.community];
    }

    return [fixture.workshop];
}

async function handleSupabaseRequest(request, response) {
    const requestUrl = new URL(request.url ?? '/', `http://127.0.0.1:${supabasePort}`);

    if (requestUrl.pathname === '/health') {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (requestUrl.pathname === '/rest/v1/workshops') {
        sendJson(response, 200, selectWorkshopRows(requestUrl.searchParams));
        return;
    }

    if (requestUrl.pathname === '/rest/v1/Contact') {
        if (request.method === 'POST') {
            const body = await readRequestBody(request);
            sendJson(response, 201, [{ id: randomUUID(), ...body }]);
            return;
        }

        // The public AI Supervize Mini page calculates its capacity from this empty contact table.
        sendJson(response, 200, []);
        return;
    }

    if (requestUrl.pathname === '/rest/v1/workshop_participants') {
        if (request.method === 'POST') {
            const body = await readRequestBody(request);
            const participant = {
                id: randomUUID(),
                fullname: body.fullname,
                email: body.email,
                connected_at: new Date().toISOString(),
                is_interaction_banned: false,
                is_trusted: false,
                is_moderator: false,
                ...body,
            };
            participantRows.set(participant.id, participant);
            sendJson(response, 201, [participant]);
            return;
        }

        sendJson(response, 200, Array.from(participantRows.values()));
        return;
    }

    // Unused public-room collections are deliberately empty. Browser-level room submission is mocked by the test
    // itself, while this keeps the initial public page and its unauthenticated state check deterministic.
    sendJson(response, 200, []);
}

const supabaseServer = createServer((request, response) => {
    void handleSupabaseRequest(request, response).catch((error) => {
        console.error('E2E Supabase fixture failed:', error);
        sendJson(response, 500, { error: 'E2E Supabase fixture failed' });
    });
});

await new Promise((resolveServer, rejectServer) => {
    supabaseServer.once('error', rejectServer);
    supabaseServer.listen(supabasePort, '127.0.0.1', resolveServer);
});

const nextProcess = spawn(
    process.execPath,
    [resolve(rootDirectory, 'node_modules/next/dist/bin/next'), 'dev', '-p', String(nextPort)],
    {
        cwd: rootDirectory,
        env: {
            ...process.env,
            NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${supabasePort}`,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'e2e-anon-key',
            SUPABASE_SERVICE_ROLE_KEY: 'e2e-service-role-key',
            NEXT_TELEMETRY_DISABLED: '1',
        },
        stdio: 'inherit',
        windowsHide: true,
    },
);

let isShuttingDown = false;

function shutDown(exitCode) {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    supabaseServer.close();
    if (!nextProcess.killed) {
        nextProcess.kill();
    }
    process.exitCode = exitCode;
}

process.on('SIGINT', () => shutDown(130));
process.on('SIGTERM', () => shutDown(143));
nextProcess.on('error', (error) => {
    console.error('E2E Next.js server failed:', error);
    shutDown(1);
});
nextProcess.on('exit', (code) => shutDown(code ?? 1));
