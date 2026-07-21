import { getAll } from '../js/db.js';
import { formatarData } from '../utils/data.js';

let gruposEstoque = [];

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Estoque Atual</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao inicio</button>
        </div>

        <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
            <input
                id="filtro_estoque"
                class="form-control"
                style="max-width: 380px"
                placeholder="Filtrar alimento"
            >
            <span id="total_itens_estoque" class="badge text-bg-success"></span>
        </div>

        <div id="lista"></div>
    `;
}

export async function afterRender() {
    gruposEstoque = await montarEstoque();
    document.getElementById("filtro_estoque").addEventListener("input", renderizarEstoque);
    renderizarEstoque();
}

function renderizarEstoque() {
    const filtro = normalizarTexto(document.getElementById("filtro_estoque").value);
    const grupos = filtro
        ? gruposEstoque.filter(grupo => grupo.nome.includes(filtro))
        : gruposEstoque;

    document.getElementById("total_itens_estoque").textContent = `${grupos.length} itens`;
    document.getElementById("lista").innerHTML = grupos.length
        ? grupos.map(renderGrupoEstoque).join("")
        : `<div class="alert alert-info">Nenhum alimento encontrado no estoque.</div>`;
}

function renderGrupoEstoque(grupo) {
    return `
        <div class="card p-3 mb-2">
            <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div>
                    <div class="fw-semibold">${escaparHtml(grupo.nome)}</div>
                    <div class="small text-muted">${grupo.entradas.length} entrada(s) cadastrada(s)</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="fs-5 fw-semibold">
                        ${formatarNumero(grupo.quantidade)} ${escaparHtml(grupo.unidade)}
                    </span>
                </div>
            </div>

            <details class="mt-3">
                <summary class="btn btn-outline-success btn-sm">Ver detalhes</summary>
                <div class="table-responsive">
                    <table class="table table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Data cadastro</th>
                                <th>Validade</th>
                                <th>Origem</th>
                                <th>Quantidade</th>
                                <th>Unidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${grupo.entradas.map(renderEntradaDetalhe).join("")}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    `;
}

function renderEntradaDetalhe(entrada) {
    return `
        <tr>
            <td>${escaparHtml(formatarData(entrada.data) || "-")}</td>
            <td>${escaparHtml(formatarData(entrada.validade) || "-")}</td>
            <td>${escaparHtml(entrada.origem || "-")}</td>
            <td>${formatarNumero(entrada.qtd)}</td>
            <td>${escaparHtml(entrada.unidade || "")}</td>
        </tr>
    `;
}

async function montarEstoque() {
    const [entradas, saidas] = await Promise.all([
        getAll("entradas"),
        getAll("saidas")
    ]);
    const grupos = new Map();

    entradas.forEach((entrada) => {
        const nome = normalizarTexto(entrada.nome);
        if (!nome) return;

        if (!grupos.has(nome)) {
            grupos.set(nome, {
                id: grupos.size + 1,
                nome,
                quantidade: 0,
                unidade: entrada.unidade || "",
                entradas: []
            });
        }

        const grupo = grupos.get(nome);
        grupo.quantidade += Number(entrada.qtd || 0);
        grupo.unidade = escolherUnidade(grupo.unidade, entrada.unidade);
        grupo.entradas.push(entrada);
    });

    saidas.forEach((saida) => {
        const nome = normalizarTexto(saida.nome);
        const grupo = grupos.get(nome);
        if (!grupo) return;

        grupo.quantidade -= Number(saida.qtd || 0);
        grupo.unidade = escolherUnidade(grupo.unidade, saida.unidade);
    });

    return Array.from(grupos.values())
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

function escolherUnidade(unidadeAtual, novaUnidade) {
    if (!unidadeAtual) return novaUnidade || "";
    if (!novaUnidade || unidadeAtual === novaUnidade) return unidadeAtual;
    return "unidades variadas";
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        maximumFractionDigits: 4
    });
}

function escaparHtml(valor) {
    const div = document.createElement("div");
    div.textContent = String(valor ?? "");
    return div.innerHTML;
}
