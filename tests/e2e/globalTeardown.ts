import { mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';

const E2E_ARTIFACTS_DIRECTORY = path.resolve(process.cwd(), 'tests/e2e/.artifacts');
const E2E_VIDEOS_DIRECTORY = path.resolve(process.cwd(), 'tests/e2e/videos');

async function findVideos(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
            return [];
        }

        throw error;
    });
    const videos: string[] = [];

    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            videos.push(...(await findVideos(entryPath)));
        } else if (entry.isFile() && entry.name.endsWith('.webm')) {
            videos.push(entryPath);
        }
    }

    return videos;
}

function createVideoFileName(sourcePath: string, index: number, timestamp: string): string {
    const sourceName = path
        .relative(E2E_ARTIFACTS_DIRECTORY, sourcePath)
        .replace(/\.webm$/i, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    return `${timestamp}-${String(index + 1).padStart(2, '0')}-${sourceName || 'e2e'}.webm`;
}

/**
 * Playwright places recordings beside test artifacts under generated names.
 * Keep the artifacts separate, while preserving each finished recording in the
 * requested, timestamped video archive.
 */
export default async function archiveE2eVideos(): Promise<void> {
    const videos = await findVideos(E2E_ARTIFACTS_DIRECTORY);

    if (videos.length === 0) {
        return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await mkdir(E2E_VIDEOS_DIRECTORY, { recursive: true });

    await Promise.all(
        videos.map((videoPath, index) =>
            rename(videoPath, path.join(E2E_VIDEOS_DIRECTORY, createVideoFileName(videoPath, index, timestamp))),
        ),
    );

    console.info(`Saved ${videos.length} E2E video(s) to tests/e2e/videos/.`);
}
