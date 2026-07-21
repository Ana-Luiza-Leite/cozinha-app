import { getAll } from '../js/db.js';
import { calcularEstoque } from '../services/estoqueService.js';
import { formatarData, obterDataOrdenacao } from '../utils/data.js';

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Relatórios</h2>
            <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao início</button>
                <button class="btn btn-outline-success" onclick="window.print()">Imprimir</button>
            </div>
        </div>

        <div class="row g-3 mb-4" id="resumo"></div>

        <h4>Estoque atual</h4>
        <div id="estoque" class="mb-4"></div>

        <h4>Movimentações</h4>
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
    ].sort((a, b) => obterDataOrdenacao(b.data) - obterDataOrdenacao(a.data));

    document.getElementById("movimentacoes").innerHTML = movimentos.length
        ? `
            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Origem/Destino</th>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Unidade</th>
                            <th>Valor unitario</th>
                            <th>Valor total</th>
                            <th>Validade</th>
                            <th>Nota</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movimentos.map(item => `
                            <tr>
                                <td>${item.tipo}</td>
                                <td>${formatarData(item.data)}</td>
                                <td>${item.origem || item.destino || ""}</td>
                                <td>${item.nome || ""}</td>
                                <td>${item.qtd || 0}</td>
                                <td>${item.unidade || ""}</td>
                                <td>${formatarNumero(item.valor_unitario)}</td>
                                <td>${formatarNumero(item.valor_total)}</td>
                                <td>${formatarData(item.validade)}</td>
                                <td>${item.nota || ""}</td>
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

function formatarNumero(valor) {
    if (valor === undefined || valor === null || valor === "") return "";

    return Number(valor || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
