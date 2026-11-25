// Camada central compartilhada para permissões administrativas e confirmação.
// Este módulo complementa authService.js e db.js sem alterar o schema IndexedDB.

export async function exigirAdministrador() {
    const { getUsuarioAtual } = await import("../services/authService.js");
    const usuario = await getUsuarioAtual();

    if (!usuario || usuario.perfil !== "admin") {
        throw new Error("Somente administradores podem executar esta operação.");
    }

    return usuario;
}

export async function executarEdicaoAdmin(operacao) {
    await exigirAdministrador();
    const { confirmarAlteracaoAdmin } = await import("./confirmacaoAdminService.js");
    await confirmarAlteracaoAdmin();
    return await operacao();
}

export async function executarExclusaoAdmin(operacao) {
    await exigirAdministrador();
    const { confirmarAlteracaoAdmin } = await import("./confirmacaoAdminService.js");
    await confirmarAlteracaoAdmin();
    return await operacao();
}
