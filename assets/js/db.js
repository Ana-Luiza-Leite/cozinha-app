const DB_NAME = "cozinhaDB";
const DB_VERSION = 1;

let db;

export function initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
        db = e.target.result;

        db.createObjectStore("entradas", { keyPath: "id", autoIncrement: true });
        db.createObjectStore("saidas", { keyPath: "id", autoIncrement: true });
        db.createObjectStore("insumos", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        console.log("Banco pronto");
    };
}

export function getAll(storeName) {
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
    });
}

export function add(storeName, data) {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).add(data);
}