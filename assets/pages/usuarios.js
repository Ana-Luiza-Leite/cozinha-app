import { listarUsuarios, aprovarUsuario, bloquearUsuario } from "../services/authService.js";

export function render() {
    return `<h2>Gestão de usuários</h2><div id="usuarios-mensagem"></div><div id="usuarios-lista">Carregando...</div>`;
}

export async function afterRender() {
    const lista = document.getElementById("usuarios-lista");
    const mensagem = document.getElementById("usuarios-mensagem");
    const carregar = async () => {
        const usuarios = await listarUsuarios();
        lista.innerHTML = `<div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>${usuarios.map(u => `<tr><td>${esc(u.nome)}</td><td>${esc(u.usuario)}</td><td>${esc(u.perfil)}</td><td>${esc(u.status)}</td><td>${u.perfil === "membro" ? `${u.status === "pendente" ? `<button class="btn btn-sm btn-success" data-aprovar="${u.id}">Aprovar</button>` : ""}${u.status !== "bloqueado" ? ` <button class="btn btn-sm btn-outline-danger" data-bloquear="${u.id}">Bloquear</button>` : ""}` : "—"}</td></tr>`).join("")}</tbody></table></div>`;
        lista.querySelectorAll("[data-aprovar]").forEach(btn => btn.addEventListener("click", async () => { try { await aprovarUsuario(btn.dataset.aprovar); await carregar(); } catch (e) { mensagem.textContent = e.message; } }));
        lista.querySelectorAll("[data-bloquear]").forEach(btn => btn.addEventListener("click", async () => { try { await bloquearUsuario(btn.dataset.bloquear); await carregar(); } catch (e) { mensagem.textContent = e.message; } }));
    };
    await carregar();
}

function esc(valor) { const el = document.createElement("span"); el.textContent = valor ?? ""; return el.innerHTML; }
