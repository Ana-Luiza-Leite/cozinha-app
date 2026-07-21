const DB_NAME = "cozinhaDB";
const DB_VERSION = 3;

const FORNECEDORES_INICIAIS = [
    { nome: "COOPERFAMILIA", cnpj: "09.263.339/0001-55" },
    { nome: "COOP OURO DO SUL", cnpj: "91.360.420/0001-34" },
    { nome: "COOP SERTAO SANTANA", cnpj: "14.782.568/0001-16" },
    { nome: "COOPAT", cnpj: "", observacao: "CNPJ nao encontrado com esse nome exato" },
    { nome: "FIOCRUZ", cnpj: "33.781.055/0001-35" },
    { nome: "COOP SUINO CAI", cnpj: "91.360.420/0001-34" },
    { nome: "MESA BRASIL", cnpj: "", observacao: "Possui varios CNPJs conforme a unidade/regiao" },
    { nome: "COOP MISTA ORIGEM CAMPONESA", cnpj: "", observacao: "CNPJ nao encontrado com esse nome exato" }
];

const DESTINOS_INICIAIS = [
    { nome: "CSA" },
    { nome: "MARISTAS" },
    { nome: "LAMI" },
    { nome: "BOM FIM" },
    { nome: "OCMT" },
    { nome: "OPSM" }
];

let db;
let dbPromise;

export function initDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const database = e.target.result;

            [
                "entradas",
                "saidas",
                "insumos",
                "fornecedores",
                "doadores",
                "destinos",
                "beneficiados",
                "fichasTecnicas"
            ].forEach((storeName) => {
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
                }
            });
        };

        request.onsuccess = async (e) => {
            db = e.target.result;
            await garantirDadosIniciais(db);
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

export async function put(storeName, data) {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).put(data);

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function garantirDadosIniciais(database) {
    return Promise.all([
        garantirRegistrosIniciais(database, "fornecedores", FORNECEDORES_INICIAIS, {
            email: "",
            telefone: ""
        }),
        garantirRegistrosIniciais(database, "destinos", DESTINOS_INICIAIS)
    ]);
}

function garantirRegistrosIniciais(database, storeName, registros, padrao = {}) {
    return new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => {
            const nomesExistentes = new Set(req.result.map(item => normalizarTexto(item.nome)));

            registros.forEach((registro) => {
                if (!nomesExistentes.has(normalizarTexto(registro.nome))) {
                    store.add({
                        ...padrao,
                        ...registro
                    });
                }
            });
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}
