/**
 * The local storage of the browser, or `null` where there is none to write into
 *
 * Note: Every page of this site is also rendered on the server, where no browser storage exists at all, and the privacy
 *       settings of a browser can refuse it outright. Both are answered by remembering nothing rather than by an error,
 *       because everything which stores something here works without what it stored.
 */
export function getBrowserLocalStorage(): Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

/**
 * Reads one value the browser remembers
 *
 * @param storageKey key the value is stored under
 * @returns the stored value, `null` when there is none or when the storage cannot be read
 */
export function readBrowserLocalStorageItem(storageKey: string): string | null {
    const storage = getBrowserLocalStorage();

    if (storage === null) {
        return null;
    }

    try {
        return storage.getItem(storageKey);
    } catch {
        return null;
    }
}

/**
 * Asks the browser to remember one value
 *
 * Note: A storage which is full or disabled must never interrupt what the visitor is doing, so a refused write is
 *       simply a value which is not remembered.
 *
 * @param storageKey key the value is stored under
 * @param value what to store
 */
export function writeBrowserLocalStorageItem(storageKey: string, value: string): void {
    const storage = getBrowserLocalStorage();

    if (storage === null) {
        return;
    }

    try {
        storage.setItem(storageKey, value);
    } catch {
        // There is nothing to report: the value stays unremembered and the page carries on.
    }
}

/**
 * Asks the browser to forget one value
 *
 * @param storageKey key the value is stored under
 */
export function removeBrowserLocalStorageItem(storageKey: string): void {
    const storage = getBrowserLocalStorage();

    if (storage === null) {
        return;
    }

    try {
        storage.removeItem(storageKey);
    } catch {
        // Storage can become unavailable between reading and removing, which is not a failure of the page either.
    }
}
