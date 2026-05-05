const DB_NAME = "certifast-resident-id-uploads";
const DB_VERSION = 1;
const STORE_NAME = "uploads";

function openDb() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("IndexedDB is not available"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
            reject(request.error || new Error("Could not open IndexedDB"));
    });
}

function withStore(mode, run) {
    return openDb().then(
        (db) =>
            new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, mode);
                const store = tx.objectStore(STORE_NAME);
                const request = run(store);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () =>
                    reject(request.error || new Error("IndexedDB request failed"));
                tx.oncomplete = () => db.close();
                tx.onerror = () => {
                    db.close();
                    reject(tx.error || new Error("IndexedDB transaction failed"));
                };
            }),
    );
}

export function savePendingResidentIdUpload(userId, file) {
    if (!userId || !file) return Promise.resolve();
    return withStore("readwrite", (store) =>
        store.put(
            {
                file,
                name: file.name,
                type: file.type,
                savedAt: Date.now(),
            },
            userId,
        ),
    );
}

export function getPendingResidentIdUpload(userId) {
    if (!userId) return Promise.resolve(null);
    return withStore("readonly", (store) => store.get(userId)).catch(() => null);
}

export function deletePendingResidentIdUpload(userId) {
    if (!userId) return Promise.resolve();
    return withStore("readwrite", (store) => store.delete(userId)).catch(() => {});
}
