const DB_NAME = "cozinhaDB";
const DB_VERSION = 1;

let db;
let dbPromise;

export function initDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const database = e.target.result;

            if (!database.objectStoreNames.contains("entradas")) {
                database.createObjectStore("entradas", { keyPath: "id", autoIncrement: true });
            }

            if (!database.objectStoreNames.contains("saidas")) {
                database.createObjectStore("saidas", { keyPath: "id", autoIncrement: true });
            }

            if (!database.objectStoreNames.contains("insumos")) {
                database.createObjectStore("insumos", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            console.log("Banco pronto");
            resolve(db);
        };

        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

async function getDB() {
    if (db) return db;
    return initDB();
}

export async function getAll(storeName) {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function add(storeName, data) {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).add(data);

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
