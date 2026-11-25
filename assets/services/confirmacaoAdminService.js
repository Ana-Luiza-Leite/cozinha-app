const CHAVE_HASH = "cozinha_confirmacao_admin_hash_v2";
const SALT = "cozinha-inteligente-confirmacao-v2";
const ITERACOES = 310000;

async function hash(senha) {
    if (!globalThis.crypto?.subtle) {
        throw new Error("A confirmação exige Web Crypto em HTTPS ou localhost.");
    }

    const material = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(String(senha)),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: new TextEncoder().encode(SALT),
            iterations: ITERACOES,
            hash: "SHA-256"
        },
        material,
        256
    );

    return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function confirmarAlteracaoAdmin() {
    const senha = window.prompt("Confirmação administrativa:");

    if (senha === null) {
        throw new Error("Operação cancelada.");
    }

    const verificador = await hash("8080");

    // Mantém o hash local apenas como verificador da credencial fixa.
    // A senha "8080" não é armazenada em texto puro.
    localStorage.setItem(CHAVE_HASH, verificador);

    if (await hash(senha) !== verificador) {
        throw new Error("Operação cancelada: confirmação administrativa inválida.");
    }

    return true;
}

export async function validarConfirmacaoAdmin(senha) {
    return await hash(senha) === await hash("8080");
}
