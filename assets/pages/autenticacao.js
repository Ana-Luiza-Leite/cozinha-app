import { login, logout, solicitarCadastro, inicializarAdmin } from "../services/authService.js";

export function render() {
    const cadastro = window.location.hash.startsWith("#/cadastro");
    return `<section class="card mx-auto" style="max-width:480px"><div class="card-body">
        <h2>${cadastro ? "Solicitar cadastro" : "Entrar"}</h2>
        <div id="auth-mensagem" aria-live="polite"></div>
        ${cadastro ? `<form id="cadastro-form">
            <label class="form-label">Nome completo<input class="form-control" name="nome" required></label>
            <label class="form-label">Nome de usuário<input class="form-control" name="usuario" required minlength="3"></label>
            <label class="form-label">Senha<input class="form-control" name="senha" type="password" required minlength="8"></label>
            <label class="form-label">Confirme a senha<input class="form-control" name="confirmacao" type="password" required minlength="8"></label>
            <button class="btn btn-danger">Enviar solicitação</button>
        </form><p class="mt-3"><a href="#/login">Voltar ao login</a></p>` : `<form id="login-form">
            <label class="form-label">Usuário<input class="form-control" name="usuario" required autocomplete="username"></label>
            <label class="form-label">Senha<input class="form-control" name="senha" type="password" required autocomplete="current-password"></label>
            <button class="btn btn-danger">Entrar</button>
        </form><p class="mt-3"><a href="#/cadastro">Solicitar acesso de membro</a></p>
        <details class="mt-3"><summary>Primeira configuração</summary><p>A conta admin é criada uma única vez. Escolha uma senha segura.</p>
        <form id="admin-form"><label class="form-label">Senha inicial do admin<input class="form-control" name="senha" type="password" minlength="8" required></label><button class="btn btn-outline-secondary">Criar conta admin</button></form></details>`}
    </div></section>`;
}

export function afterRender() {
    const mensagem = document.getElementById("auth-mensagem");
    const mostrar = (texto, tipo = "danger") => { mensagem.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`; };
    document.getElementById("login-form")?.addEventListener("submit", async event => {
        event.preventDefault();
        const dados = new FormData(event.currentTarget);
        try { await login(dados.get("usuario"), dados.get("senha")); window.location.hash = "#/"; }
        catch (error) { mostrar(error.message); }
    });
    document.getElementById("cadastro-form")?.addEventListener("submit", async event => {
        event.preventDefault();
        const dados = new FormData(event.currentTarget);
        if (dados.get("senha") !== dados.get("confirmacao")) return mostrar("As senhas não coincidem.");
        try { await solicitarCadastro({ nome: dados.get("nome"), usuario: dados.get("usuario"), senha: dados.get("senha") }); mostrar("Solicitação enviada. Aguarde a aprovação do administrador.", "success"); event.currentTarget.reset(); }
        catch (error) { mostrar(error.message); }
    });
    document.getElementById("admin-form")?.addEventListener("submit", async event => {
        event.preventDefault();
        try { const dados = new FormData(event.currentTarget); const resultado = await inicializarAdmin(dados.get("senha")); mostrar(resultado.mensagem, resultado.criado ? "success" : "warning"); }
        catch (error) { mostrar(error.message); }
    });
}

export { logout };
