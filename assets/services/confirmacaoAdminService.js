const CHAVE_HASH = "cozinha_confirmacao_admin_hash";
const SALT = "cozinha-inteligente-confirmacao-v1";

async function hash(senha) {
    const material = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: new TextEncoder().encode(SALT), iterations: 310000, hash: "SHA-256" },
        material, 256
    );
    return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function confirmarAlteracaoAdmin() {
    const senha = window.prompt("Confirme a operação administrativa:");
    if (senha === null) throw new Error("Operação cancelada.");
    const verificador = localStorage.getItem(CHAVE_HASH) || await hash("8080");
    if (!localStorage.getItem(CHAVE_HASH)) localStorage.setItem(CHAVE_HASH, verificador);
    if (await hash(senha) !== verificador) {
        throw new Error("Operação cancelada: confirmação administrativa inválida.");
    }
    return true;
}
