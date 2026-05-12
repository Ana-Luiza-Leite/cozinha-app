import { getAll } from '../js/db.js';
import { calcularEstoque } from '../services/estoqueService.js';

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Relatorios</h2>
            <button class="btn btn-outline-success" onclick="window.print()">Imprimir</button>
        </div>

        <div class="row g-3 mb-4" id="resumo"></div>

        <h4>Estoque atual</h4>
        <div id="estoque" class="mb-4"></div>

        <h4>Movimentacoes</h4>
        <div id="movimentacoes"></div>
    `;
}

export async function afterRender() {
    const [entradas, saidas, estoque] = await Promise.all([
        getAll("entradas"),
        getAll("saidas"),
        calcularEstoque()
    ]);

    const totalEntradas = somarQtd(entradas);
    const totalSaidas = somarQtd(saidas);
    const itensEmEstoque = Object.values(estoque).filter(qtd => qtd > 0).length;

    document.getElementById("resumo").innerHTML = [
        cardResumo("Entradas", totalEntradas),
        cardResumo("Saidas", totalSaidas),
        cardResumo("Itens em estoque", itensEmEstoque)
    ].join("");

    document.getElementById("estoque").innerHTML = Object.keys(estoque).length
        ? Object.entries(estoque).map(([nome, qtd]) => `
            <div class="card p-2 mb-2">
                <strong>${nome}</strong>: ${qtd}
            </div>
        `).join("")
        : `<div class="alert alert-info">Nenhum item em estoque.</div>`;

    const movimentos = [
        ...entradas.map(item => ({ ...item, tipo: "Entrada" })),
        ...saidas.map(item => ({ ...item, tipo: "Saida" }))
    ].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    document.getElementById("movimentacoes").innerHTML = movimentos.length
        ? `
            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Unidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movimentos.map(item => `
                            <tr>
                                <td>${item.tipo}</td>
                                <td>${formatarData(item.data)}</td>
                                <td>${item.nome || ""}</td>
                                <td>${item.qtd || 0}</td>
                                <td>${item.unidade || ""}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `
        : `<div class="alert alert-info">Nenhuma movimentacao registrada.</div>`;
}

function cardResumo(titulo, valor) {
    return `
        <div class="col-md-4">
            <div class="card p-3 text-center">
                <h6>${titulo}</h6>
                <strong class="fs-4">${valor}</strong>
            </div>
        </div>
    `;
}

function somarQtd(lista) {
    return lista.reduce((total, item) => total + Number(item.qtd || 0), 0);
}

function formatarData(data) {
    if (!data) return "";

    const dataFormatada = new Date(data);
    if (Number.isNaN(dataFormatada.getTime())) return String(data);

    return dataFormatada.toLocaleDateString("pt-BR");
}
