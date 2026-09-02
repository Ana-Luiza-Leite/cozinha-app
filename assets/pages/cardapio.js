import { add, getAll, put, remove } from '../js/db.js';
import { aplicarMascaraData, formatarData, obterDataOrdenacao } from '../utils/data.js';

const DIAS_SEMANA = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta"];
const REFEICOES = ["Almoco", "Jantar"];

let fichasTecnicas = [];
let destinos = [];
let cardapiosSalvos = [];
let estoqueAtual = new Map();
let cardapioAtual = criarCardapioVazio();

export function render() {
    return `
        <style>
            @media print {
                body * {
                    visibility: hidden;
                }

                #area-impressao-cardapio,
                #area-impressao-cardapio * {
                    visibility: visible;
                }

                #area-impressao-cardapio {
                    display: block !important;
                    position: absolute;
                    inset: 0;
                    padding: 24px;
                    background: #fff;
                }
            }
        </style>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h2 class="mb-0">Cardapio</h2>
                <p class="text-muted mb-0">Monte o menu semanal com fichas tecnicas e confira o estoque.</p>
            </div>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao inicio</button>
        </div>

        <div class="card p-3 mb-4">
            <div class="row g-3 align-items-end">
                <div class="col-md-3">
                    <label class="form-label" for="cardapio_semana">Semana inicia em</label>
                    <input id="cardapio_semana" class="form-control" placeholder="dd/mm/aaaa">
                </div>

                <div class="col-md-3">
                    <label class="form-label" for="cardapio_cozinha">Cozinha</label>
                    <select id="cardapio_cozinha" class="form-select"></select>
                </div>

                <div class="col-md-3">
                    <label class="form-label" for="cardapio_salvo">Cardapios salvos</label>
                    <select id="cardapio_salvo" class="form-select"></select>
                </div>

                <div class="col-md-3 d-flex gap-2">
                    <button id="btn-carregar-cardapio" class="btn btn-outline-success flex-fill" type="button">
                        Abrir
                    </button>
                    <button id="btn-novo-cardapio" class="btn btn-outline-secondary flex-fill" type="button">
                        Novo
                    </button>
                </div>

                <div class="col-md-2">
                    <label class="form-label" for="cardapio_dia">Dia</label>
                    <select id="cardapio_dia" class="form-select">
                        ${DIAS_SEMANA.map(dia => `<option value="${dia}">${dia}</option>`).join("")}
                    </select>
                </div>

                <div class="col-md-2">
                    <label class="form-label" for="cardapio_refeicao">Refeicao</label>
                    <select id="cardapio_refeicao" class="form-select">
                        ${REFEICOES.map(refeicao => `<option value="${refeicao}">${refeicao}</option>`).join("")}
                    </select>
                </div>

                <div class="col-md-5">
                    <label class="form-label" for="cardapio_ficha">Ficha tecnica</label>
                    <select id="cardapio_ficha" class="form-select"></select>
                </div>

                <div class="col-md-1">
                    <label class="form-label" for="cardapio_porcoes">Porcoes</label>
                    <input id="cardapio_porcoes" class="form-control" type="number" min="1" step="1">
                </div>

                <div class="col-md-2">
                    <button id="btn-adicionar-ficha" class="btn btn-success w-100" type="button">
                        Adicionar
                    </button>
                </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
                <button id="btn-salvar-cardapio" class="btn btn-success" type="button">
                    Salvar cardapio
                </button>
                <button id="btn-imprimir-cardapio" class="btn btn-outline-success" type="button">
                    Imprimir fichas
                </button>
            </div>
        </div>

        <div id="resumo-cardapio" class="mb-3"></div>
        <div id="grade-cardapio"></div>
        <div id="area-impressao-cardapio" class="d-none"></div>
    `;
}

export async function afterRender() {
    await carregarDados();
    preencherFormulario();
    aplicarMascaraData("cardapio_semana");

    document.getElementById("cardapio_semana").addEventListener("input", atualizarCardapioFormulario);
    document.getElementById("cardapio_cozinha").addEventListener("change", atualizarCardapioFormulario);
    document.getElementById("btn-adicionar-ficha").addEventListener("click", adicionarFichaAoCardapio);
    document.getElementById("btn-salvar-cardapio").addEventListener("click", salvarCardapio);
    document.getElementById("btn-imprimir-cardapio").addEventListener("click", imprimirFichasDoCardapio);
    document.getElementById("btn-carregar-cardapio").addEventListener("click", carregarCardapioSelecionado);
    document.getElementById("btn-novo-cardapio").addEventListener("click", iniciarNovoCardapio);

    renderizarCardapio();
}

window.removerFichaCardapio = function (id) {
    cardapioAtual.itens = cardapioAtual.itens.filter(item => item.id !== id);
    renderizarCardapio();
};

window.excluirCardapio = async function (id) {
    if (!confirm("Excluir este cardapio?")) return;
    await remove("cardapios", id);
    await carregarDados();
    iniciarNovoCardapio();
};

async function carregarDados() {
    const [fichas, cozinhas, cardapios, entradas, saidas] = await Promise.all([
        getAll("fichasTecnicas"),
        getAll("destinos"),
        getAll("cardapios"),
        getAll("entradas"),
        getAll("saidas")
    ]);

    fichasTecnicas = fichas;
    destinos = cozinhas;
    cardapiosSalvos = cardapios;
    estoqueAtual = montarEstoque(entradas, saidas);
}

function preencherFormulario() {
    document.getElementById("cardapio_semana").value = cardapioAtual.semanaInicio || dataInicioSemana();
    document.getElementById("cardapio_porcoes").value = "";

    preencherSelectCozinhas();
    preencherSelectFichas();
    preencherSelectCardapios();
}

function preencherSelectCozinhas() {
    const select = document.getElementById("cardapio_cozinha");
    select.innerHTML = destinos.length
        ? `
            <option value="">Todas as cozinhas</option>
            ${destinos.map(destino => `
                <option value="${destino.id}">${escaparHtml(destino.nome)}</option>
            `).join("")}
        `
        : `<option value="">Nenhuma cozinha cadastrada</option>`;
}

function preencherSelectFichas() {
    const select = document.getElementById("cardapio_ficha");
    select.innerHTML = fichasTecnicas.length
        ? fichasTecnicas.map(ficha => `
            <option value="${ficha.id}">${escaparHtml(ficha.nome)}</option>
        `).join("")
        : `<option value="">Cadastre uma ficha tecnica primeiro</option>`;
}

function preencherSelectCardapios() {
    const select = document.getElementById("cardapio_salvo");
    select.innerHTML = cardapiosSalvos.length
        ? cardapiosSalvos
            .slice()
            .sort((a, b) => obterDataOrdenacao(b.semanaInicio) - obterDataOrdenacao(a.semanaInicio))
            .map(cardapio => `
                <option value="${cardapio.id}">
                    ${escaparHtml(cardapio.semanaInicio || "Sem data")} - ${escaparHtml(cardapio.cozinha || "Todas")}
                </option>
            `).join("")
        : `<option value="">Nenhum cardapio salvo</option>`;
}

function atualizarCardapioFormulario() {
    const cozinhaSelect = document.getElementById("cardapio_cozinha");
    cardapioAtual.semanaInicio = formatarData(document.getElementById("cardapio_semana").value);
    cardapioAtual.cozinhaId = cozinhaSelect.value ? Number(cozinhaSelect.value) : "";
    cardapioAtual.cozinha = cozinhaSelect.selectedOptions[0]?.text || "";
    renderizarCardapio();
}

function adicionarFichaAoCardapio() {
    const fichaId = Number(document.getElementById("cardapio_ficha").value);
    const ficha = fichasTecnicas.find(item => item.id === fichaId);
    const porcoes = Number(document.getElementById("cardapio_porcoes").value || 0);

    if (!ficha) {
        alert("Selecione uma ficha tecnica.");
        return;
    }

    if (!porcoes) {
        alert("Informe a quantidade de porcoes.");
        return;
    }

    atualizarCardapioFormulario();
    cardapioAtual.itens.push({
        id: Date.now(),
        dia: document.getElementById("cardapio_dia").value,
        refeicao: document.getElementById("cardapio_refeicao").value,
        fichaId,
        fichaNome: ficha.nome,
        porcoes
    });

    document.getElementById("cardapio_porcoes").value = "";
    renderizarCardapio();
}

async function salvarCardapio() {
    atualizarCardapioFormulario();

    if (!cardapioAtual.itens.length) {
        alert("Adicione ao menos uma ficha tecnica ao cardapio.");
        return;
    }

    const registro = {
        ...cardapioAtual,
        semanaInicio: formatarData(cardapioAtual.semanaInicio),
        atualizadoEm: new Date().toISOString()
    };

    if (registro.id) {
        await put("cardapios", registro);
    } else {
        registro.criadoEm = new Date().toISOString();
        registro.id = await add("cardapios", registro);
        cardapioAtual.id = registro.id;
    }

    await carregarDados();
    preencherSelectCardapios();
    alert("Cardapio salvo.");
}

function carregarCardapioSelecionado() {
    const id = Number(document.getElementById("cardapio_salvo").value);
    const cardapio = cardapiosSalvos.find(item => item.id === id);
    if (!cardapio) return;

    cardapioAtual = {
        ...criarCardapioVazio(),
        ...cardapio,
        itens: cardapio.itens || []
    };

    document.getElementById("cardapio_semana").value = cardapioAtual.semanaInicio || "";
    document.getElementById("cardapio_cozinha").value = cardapioAtual.cozinhaId || "";
    renderizarCardapio();
}

function iniciarNovoCardapio() {
    cardapioAtual = criarCardapioVazio();
    preencherFormulario();
    renderizarCardapio();
}

function renderizarCardapio() {
    const itens = cardapioAtual.itens || [];
    const avaliacoes = aplicarVerificacaoEstoqueGeral(itens.map(avaliarItemCardapio));
    const temFalta = avaliacoes.some(item => !item.suficiente);

    document.getElementById("resumo-cardapio").innerHTML = `
        <div class="alert ${temFalta ? "alert-danger" : "alert-success"}">
            ${itens.length
                ? `${itens.length} ficha(s) no cardapio. ${temFalta ? "Ha itens insuficientes no estoque." : "Estoque suficiente para o cardapio."}`
                : "Selecione fichas tecnicas para montar o cardapio da semana."
            }
        </div>
    `;

    document.getElementById("grade-cardapio").innerHTML = `
        <div class="row g-3">
            ${DIAS_SEMANA.map(dia => renderDiaCardapio(dia, avaliacoes)).join("")}
        </div>
        ${cardapioAtual.id ? `
            <div class="d-flex justify-content-end mt-3">
                <button
                    class="btn btn-outline-danger btn-sm"
                    type="button"
                    onclick="excluirCardapio(${cardapioAtual.id})"
                >
                    Excluir cardapio salvo
                </button>
            </div>
        ` : ""}
    `;
}

function renderDiaCardapio(dia, avaliacoes) {
    const itensDoDia = avaliacoes.filter(item => item.dia === dia);
    const dataDia = calcularDataDoDia(cardapioAtual.semanaInicio, dia);

    return `
        <div class="col-xl">
            <div class="card h-100 p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="mb-0">${dia}</h5>
                        <div class="small text-muted">${dataDia || "Sem data"}</div>
                    </div>
                    <span class="badge ${itensDoDia.every(item => item.suficiente) ? "text-bg-success" : "text-bg-danger"}">
                        ${itensDoDia.length || 0}
                    </span>
                </div>

                ${REFEICOES.map(refeicao => renderRefeicao(dia, refeicao, itensDoDia)).join("")}
            </div>
        </div>
    `;
}

function renderRefeicao(dia, refeicao, itensDoDia) {
    const itens = itensDoDia.filter(item => item.refeicao === refeicao);

    return `
        <div class="border-top pt-2 mt-2">
            <div class="fw-semibold small text-uppercase">${refeicao}</div>
            ${itens.length
                ? itens.map(renderFichaNoCardapio).join("")
                : `<div class="small text-muted">Sem ficha selecionada.</div>`
            }
        </div>
    `;
}

function renderFichaNoCardapio(item) {
    return `
        <div class="border rounded p-2 mt-2 ${item.suficiente ? "border-success" : "border-danger"}">
            <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                    <div class="fw-semibold">${escaparHtml(item.fichaNome)}</div>
                    <div class="small">${formatarNumero(item.porcoes)} porcoes</div>
                </div>
                <button
                    class="btn btn-outline-danger btn-sm"
                    type="button"
                    onclick="removerFichaCardapio(${item.id})"
                >
                    Remover
                </button>
            </div>

            <details class="mt-2">
                <summary class="small ${item.suficiente ? "text-success" : "text-danger"}">
                    ${item.suficiente ? "Estoque suficiente" : "Ver faltas no estoque"}
                </summary>
                ${renderDetalhesEstoque(item)}
            </details>
        </div>
    `;
}

function renderDetalhesEstoque(item) {
    if (!item.ingredientes.length) {
        return `<div class="small text-muted mt-2">Ficha sem ingredientes cadastrados.</div>`;
    }

    return `
        <div class="table-responsive mt-2">
            <table class="table table-sm mb-0">
                <thead>
                    <tr>
                        <th>Ingrediente</th>
                        <th>Necessario ficha</th>
                        <th>Necessario cardapio</th>
                        <th>Estoque</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${item.ingredientes.map(ingrediente => `
                        <tr>
                            <td>${escaparHtml(ingrediente.nome)}</td>
                            <td>${formatarNumero(ingrediente.necessario)} ${escaparHtml(ingrediente.unidade)}</td>
                            <td>${formatarNumero(ingrediente.necessarioTotal)} ${escaparHtml(ingrediente.unidade)}</td>
                            <td>${formatarNumero(ingrediente.disponivel)} ${escaparHtml(ingrediente.unidade)}</td>
                            <td>
                                <span class="badge ${ingrediente.suficiente ? "text-bg-success" : "text-bg-danger"}">
                                    ${ingrediente.suficiente ? "OK" : "Falta"}
                                </span>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function avaliarItemCardapio(item) {
    const ficha = fichasTecnicas.find(fichaTecnica => fichaTecnica.id === item.fichaId);
    const ingredientes = (ficha?.itens || []).map(ingrediente => avaliarIngrediente(ingrediente, item.porcoes));

    return {
        ...item,
        ficha,
        ingredientes,
        suficiente: ingredientes.length
            ? ingredientes.every(ingrediente => ingrediente.suficiente)
            : false
    };
}

function avaliarIngrediente(ingrediente, porcoes) {
    const nome = normalizarTexto(ingrediente.produto);
    const unidade = normalizarUnidade(ingrediente.unidadeMedida);
    const quantidadeBase = Number(ingrediente.quantidadePerCapita || 0)
        ? Number(ingrediente.quantidadePerCapita || 0) * Number(porcoes || 0)
        : Number(ingrediente.quantidadeTotal || ingrediente.quantidadeCompra || 0);

    return {
        chave: chaveEstoque(nome, unidade),
        nome,
        unidade,
        necessario: quantidadeBase,
        necessarioTotal: quantidadeBase,
        disponivel: 0,
        suficiente: false
    };
}

function aplicarVerificacaoEstoqueGeral(avaliacoes) {
    const demandas = new Map();

    avaliacoes.forEach((item) => {
        item.ingredientes.forEach((ingrediente) => {
            demandas.set(
                ingrediente.chave,
                (demandas.get(ingrediente.chave) || 0) + ingrediente.necessario
            );
        });
    });

    avaliacoes.forEach((item) => {
        item.ingredientes.forEach((ingrediente) => {
            ingrediente.necessarioTotal = demandas.get(ingrediente.chave) || ingrediente.necessario;
            ingrediente.disponivel = estoqueAtual.get(ingrediente.chave) || 0;
            ingrediente.suficiente = ingrediente.disponivel >= ingrediente.necessarioTotal;
        });

        item.suficiente = item.ingredientes.length
            ? item.ingredientes.every(ingrediente => ingrediente.suficiente)
            : false;
    });

    return avaliacoes;
}

function montarEstoque(entradas, saidas) {
    const estoque = new Map();

    entradas.forEach((entrada) => {
        const chave = chaveEstoque(
            normalizarTexto(entrada.nome),
            normalizarUnidade(entrada.unidade)
        );
        estoque.set(chave, (estoque.get(chave) || 0) + Number(entrada.qtd || 0));
    });

    saidas.forEach((saida) => {
        const chave = chaveEstoque(
            normalizarTexto(saida.nome),
            normalizarUnidade(saida.unidade)
        );
        estoque.set(chave, (estoque.get(chave) || 0) - Number(saida.qtd || 0));
    });

    return estoque;
}

function imprimirFichasDoCardapio() {
    const avaliacoes = aplicarVerificacaoEstoqueGeral(
        (cardapioAtual.itens || []).map(avaliarItemCardapio)
    );
    const area = document.getElementById("area-impressao-cardapio");

    area.innerHTML = `
        <h1>Cardapio semanal</h1>
        <p>
            Semana: ${escaparHtml(cardapioAtual.semanaInicio || "")}
            | Cozinha: ${escaparHtml(cardapioAtual.cozinha || "Todas")}
        </p>
        ${DIAS_SEMANA.map(dia => renderDiaImpressao(dia, avaliacoes)).join("")}
    `;

    window.print();
}

function renderDiaImpressao(dia, avaliacoes) {
    const itens = avaliacoes.filter(item => item.dia === dia);
    if (!itens.length) return "";

    return `
        <section style="page-break-inside: avoid; margin-bottom: 24px;">
            <h2>${dia} - ${calcularDataDoDia(cardapioAtual.semanaInicio, dia) || ""}</h2>
            ${itens.map(item => `
                <h3>${escaparHtml(item.refeicao)}: ${escaparHtml(item.fichaNome)}</h3>
                <p>Porcoes: ${formatarNumero(item.porcoes)}</p>
                ${renderDetalhesEstoque(item)}
                ${item.ficha?.modoPreparo ? `<p>${escaparHtml(item.ficha.modoPreparo)}</p>` : ""}
            `).join("")}
        </section>
    `;
}

function calcularDataDoDia(dataInicio, dia) {
    const inicio = obterDataOrdenacao(dataInicio);
    if (Number.isNaN(inicio.getTime()) || inicio.getTime() === 0) return "";

    const data = new Date(inicio);
    data.setDate(inicio.getDate() + DIAS_SEMANA.indexOf(dia));
    return formatarData(data);
}

function dataInicioSemana() {
    const hoje = new Date();
    const dia = hoje.getDay();
    const distanciaSegunda = dia === 0 ? -6 : 1 - dia;
    hoje.setDate(hoje.getDate() + distanciaSegunda);
    return formatarData(hoje);
}

function criarCardapioVazio() {
    return {
        semanaInicio: "",
        cozinhaId: "",
        cozinha: "",
        itens: []
    };
}

function chaveEstoque(nome, unidade) {
    return `${nome}__${unidade}`;
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

function normalizarUnidade(unidade) {
    const mapa = {
        KG: "kg",
        QUILO: "kg",
        QUILOS: "kg",
        G: "g",
        GRAMA: "g",
        GRAMAS: "g",
        L: "L",
        LITRO: "L",
        LITROS: "L",
        ML: "ml",
        UN: "un",
        UNIDADE: "un",
        UNIDADES: "un",
        PCT: "pct",
        PACOTE: "pct",
        PACOTES: "pct",
        CX: "cx",
        CAIXA: "cx",
        CAIXAS: "cx"
    };

    return mapa[normalizarTexto(unidade)] || unidade || "";
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
