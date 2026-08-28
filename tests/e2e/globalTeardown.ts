import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';

const E2E_ARTIFACTS_DIRECTORY = path.resolve(process.cwd(), 'tests/e2e/.artifacts');
const E2E_VIDEOS_DIRECTORY = path.resolve(process.cwd(), 'tests/e2e/videos');

/**
 * How many finished E2E runs keep their recordings
 *
 * Note: One run archives one recording per test, so an archive which is never shortened fills the disk of the very
 *       machine which verifies the project - and a full disk fails the run it was supposed to record.
 */
const MAXIMAL_ARCHIVED_E2E_RUN_COUNT = 3;

const ARCHIVED_VIDEO_RUN_TIMESTAMP_PATTERN = /^(\d{4}-\d{2}-\d{2}T[\d-]+Z)-/;

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
 * The run one archived recording was made by, or `null` for a file which the archive did not name
 */
function getArchivedVideoRunTimestamp(videoFileName: string): string | null {
    return ARCHIVED_VIDEO_RUN_TIMESTAMP_PATTERN.exec(videoFileName)?.[1] ?? null;
}

/**
 * Drop the recordings of the runs which are older than the ones the archive keeps
 *
 * Note: Recordings are removed by whole runs rather than by single files, so the runs which are kept stay complete.
 */
async function removeOutdatedRunRecordings(): Promise<void> {
    const videoFileNames = await readdir(E2E_VIDEOS_DIRECTORY);
    const runTimestamps = new Set<string>();

    for (const videoFileName of videoFileNames) {
        const runTimestamp = getArchivedVideoRunTimestamp(videoFileName);

        if (runTimestamp !== null) {
            runTimestamps.add(runTimestamp);
        }
    }

    const outdatedRunTimestamps = new Set(
        Array.from(runTimestamps)
            .sort()
            .slice(0, Math.max(runTimestamps.size - MAXIMAL_ARCHIVED_E2E_RUN_COUNT, 0)),
    );

    if (outdatedRunTimestamps.size === 0) {
        return;
    }

    const outdatedVideoFileNames = videoFileNames.filter((videoFileName) => {
        const runTimestamp = getArchivedVideoRunTimestamp(videoFileName);

        return runTimestamp !== null && outdatedRunTimestamps.has(runTimestamp);
    });

    await Promise.all(
        outdatedVideoFileNames.map((videoFileName) => rm(path.join(E2E_VIDEOS_DIRECTORY, videoFileName))),
    );

    console.info(`Removed the E2E video(s) of ${outdatedRunTimestamps.size} outdated run(s) from tests/e2e/videos/.`);
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

    await removeOutdatedRunRecordings();
}
