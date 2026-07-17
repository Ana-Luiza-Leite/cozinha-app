import { add, getAll } from '../js/db.js';

const CATEGORIAS = [
    "Secos",
    "Hortifruti",
    "Carnes",
    "Laticinios",
    "Temperos",
    "Outros"
];

const UNIDADES = ["kg", "g", "L", "ml", "un", "pct", "cx"];

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h2 class="mb-0">Fichas técnicas</h2>
                <p class="text-muted mb-0">
                    Cadastre receitas padronizadas com rendimento, porções e insumos.
                </p>
            </div>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao início</button>
        </div>

        <div class="card p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                <h5 class="mb-0">Nova ficha técnica</h5>
                <button id="btn-adicionar-item" class="btn btn-outline-success btn-sm">
                    Adicionar item
                </button>
            </div>

            <div class="row g-3">
                <div class="col-lg-6">
                    <label class="form-label" for="ficha_nome">Nome do preparo</label>
                    <input id="ficha_nome" class="form-control" placeholder="Ex.: Proteína de soja com moranga">
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="ficha_rendimento">Rendimento</label>
                    <input id="ficha_rendimento" class="form-control" placeholder="Ex.: 650 porções">
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="ficha_numero_porcoes">Número de porções</label>
                    <input id="ficha_numero_porcoes" class="form-control" type="number" min="0" step="1">
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="ficha_rs_porcao">R$ porção</label>
                    <input id="ficha_rs_porcao" class="form-control" type="number" min="0" step="0.01">
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="ficha_rs_total">R$ total</label>
                    <input id="ficha_rs_total" class="form-control" type="number" min="0" step="0.01">
                </div>
                <div class="col-md-6">
                    <label class="form-label" for="ficha_pre_preparo">Pré preparo</label>
                    <input id="ficha_pre_preparo" class="form-control" placeholder="Ex.: higienizar, cortar, hidratar">
                </div>
                <div class="col-12">
                    <label class="form-label" for="ficha_modo_preparo">Modo de preparo / observações</label>
                    <textarea id="ficha_modo_preparo" class="form-control" rows="3"></textarea>
                </div>
            </div>

            <div class="table-responsive mt-3">
                <table class="table table-sm align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Grupo</th>
                            <th>Produto</th>
                            <th>Un.</th>
                            <th>Qtdade P</th>
                            <th>Qtdade T</th>
                            <th>FC</th>
                            <th>IC</th>
                            <th>Qt. compra</th>
                            <th>R$ unit.</th>
                            <th>R$ parcial</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="itens-ficha"></tbody>
                </table>
            </div>

            <div class="d-flex justify-content-end gap-2">
                <button id="btn-limpar-ficha" class="btn btn-outline-secondary">Limpar</button>
                <button id="btn-salvar-ficha" class="btn btn-success">Salvar ficha técnica</button>
            </div>
        </div>

        <div id="lista-fichas"></div>
    `;
}

export async function afterRender() {
    document.getElementById("btn-adicionar-item").addEventListener("click", adicionarLinhaItem);
    document.getElementById("btn-limpar-ficha").addEventListener("click", limparFormulario);
    document.getElementById("btn-salvar-ficha").addEventListener("click", salvarFichaTecnica);

    adicionarLinhaItem({
        categoria: "Secos",
        fatorCorrecao: 1,
        indiceCoccao: 1
    });
    await atualizarListaFichas();
}

function adicionarLinhaItem(item = {}) {
    const tbody = document.getElementById("itens-ficha");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>
            <select class="form-select form-select-sm campo-categoria">
                ${CATEGORIAS.map(categoria => `
                    <option value="${categoria}" ${item.categoria === categoria ? "selected" : ""}>
                        ${categoria}
                    </option>
                `).join("")}
            </select>
        </td>
        <td><input class="form-control form-control-sm campo-produto" value="${item.produto || ""}"></td>
        <td>
            <select class="form-select form-select-sm campo-unidade">
                ${UNIDADES.map(unidade => `
                    <option value="${unidade}" ${item.unidadeMedida === unidade ? "selected" : ""}>
                        ${unidade}
                    </option>
                `).join("")}
            </select>
        </td>
        <td><input class="form-control form-control-sm campo-qtd-p" type="number" min="0" step="0.0001"></td>
        <td><input class="form-control form-control-sm campo-qtd-t" type="number" min="0" step="0.0001"></td>
        <td><input class="form-control form-control-sm campo-fc" type="number" min="0" step="0.0001"></td>
        <td><input class="form-control form-control-sm campo-ic" type="number" min="0" step="0.0001"></td>
        <td><input class="form-control form-control-sm campo-qt-compra" type="number" min="0" step="0.0001"></td>
        <td><input class="form-control form-control-sm campo-rs-unitario" type="number" min="0" step="0.01"></td>
        <td><input class="form-control form-control-sm campo-rs-parcial" type="number" min="0" step="0.01"></td>
        <td>
            <button class="btn btn-outline-danger btn-sm btn-remover-item" type="button">Remover</button>
        </td>
    `;

    tr.querySelector(".campo-qtd-p").value = item.quantidadePerCapita || "";
    tr.querySelector(".campo-qtd-t").value = item.quantidadeTotal || "";
    tr.querySelector(".campo-fc").value = item.fatorCorrecao || "";
    tr.querySelector(".campo-ic").value = item.indiceCoccao || "";
    tr.querySelector(".campo-qt-compra").value = item.quantidadeCompra || "";
    tr.querySelector(".campo-rs-unitario").value = item.valorUnitario || "";
    tr.querySelector(".campo-rs-parcial").value = item.valorParcial || "";

    tr.querySelector(".btn-remover-item").addEventListener("click", () => {
        tr.remove();
        if (!tbody.children.length) adicionarLinhaItem();
    });

    ["campo-qt-compra", "campo-rs-unitario"].forEach((classe) => {
        tr.querySelector(`.${classe}`).addEventListener("input", () => atualizarParcial(tr));
    });

    tbody.appendChild(tr);
}

async function salvarFichaTecnica() {
    try {
        const nome = document.getElementById("ficha_nome").value.trim();
        const itens = lerItens();

        if (!nome) {
            alert("Informe o nome do preparo.");
            return;
        }

        if (!itens.length) {
            alert("Informe ao menos um produto da ficha técnica.");
            return;
        }

        const ficha = {
            nome,
            rendimento: document.getElementById("ficha_rendimento").value.trim(),
            numeroPorcoes: lerNumero("ficha_numero_porcoes"),
            rsPorcao: lerNumero("ficha_rs_porcao"),
            rsTotal: lerNumero("ficha_rs_total"),
            prePreparo: document.getElementById("ficha_pre_preparo").value.trim(),
            modoPreparo: document.getElementById("ficha_modo_preparo").value.trim(),
            itens,
            criadoEm: new Date().toISOString()
        };

        if (!ficha.rsTotal) {
            ficha.rsTotal = itens.reduce((total, item) => total + (item.valorParcial || 0), 0);
        }

        if (!ficha.rsPorcao && ficha.rsTotal && ficha.numeroPorcoes) {
            ficha.rsPorcao = ficha.rsTotal / ficha.numeroPorcoes;
        }

        await add("fichasTecnicas", ficha);
        limparFormulario();
        await atualizarListaFichas();
    } catch (error) {
        console.error("Erro ao salvar ficha técnica:", error);
        alert("Não foi possível salvar a ficha técnica.");
    }
}

async function atualizarListaFichas() {
    const fichas = await getAll("fichasTecnicas");
    const lista = document.getElementById("lista-fichas");

    if (!fichas.length) {
        lista.innerHTML = `
            <div class="alert alert-info">
                Nenhuma ficha técnica cadastrada ainda.
            </div>
        `;
        return;
    }

    lista.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">Fichas cadastradas</h4>
            <span class="badge text-bg-success">${fichas.length}</span>
        </div>
        <div class="row g-3">
            ${fichas.slice().reverse().map(renderCardFicha).join("")}
        </div>
    `;
}

function renderCardFicha(ficha) {
    const itensPorCategoria = agruparPorCategoria(ficha.itens || []);

    return `
        <div class="col-xl-4 col-lg-6">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between gap-3 mb-2">
                        <h5 class="card-title mb-0">${escaparHtml(ficha.nome)}</h5>
                        <span class="badge text-bg-light border">${(ficha.itens || []).length} itens</span>
                    </div>
                    <div class="row g-2 text-center mb-3">
                        ${renderIndicador("Rendimento", ficha.rendimento || "-")}
                        ${renderIndicador("Porções", ficha.numeroPorcoes || "-")}
                        ${renderIndicador("R$ porção", formatarMoeda(ficha.rsPorcao))}
                        ${renderIndicador("R$ total", formatarMoeda(ficha.rsTotal))}
                    </div>
                    ${ficha.prePreparo ? `
                        <p class="small mb-2">
                            <strong>Pré preparo:</strong> ${escaparHtml(ficha.prePreparo)}
                        </p>
                    ` : ""}
                    ${Object.entries(itensPorCategoria).map(([categoria, itens]) => `
                        <div class="mb-3">
                            <div class="fw-semibold text-success border-bottom pb-1 mb-2">
                                ${escaparHtml(categoria)}
                            </div>
                            ${itens.map(renderItemFicha).join("")}
                        </div>
                    `).join("")}
                    ${ficha.modoPreparo ? `
                        <p class="small text-muted mb-0">
                            ${escaparHtml(ficha.modoPreparo)}
                        </p>
                    ` : ""}
                </div>
            </div>
        </div>
    `;
}

function renderIndicador(rotulo, valor) {
    return `
        <div class="col-6">
            <div class="border rounded p-2 bg-light h-100">
                <div class="small text-muted">${rotulo}</div>
                <div class="fw-semibold">${escaparHtml(valor)}</div>
            </div>
        </div>
    `;
}

function renderItemFicha(item) {
    const detalhes = [
        item.quantidadePerCapita ? `${formatarNumero(item.quantidadePerCapita)} ${item.unidadeMedida}/p` : "",
        item.quantidadeTotal ? `total ${formatarNumero(item.quantidadeTotal)}` : "",
        item.quantidadeCompra ? `compra ${formatarNumero(item.quantidadeCompra)}` : "",
        item.valorParcial ? formatarMoeda(item.valorParcial) : ""
    ].filter(Boolean).join(" | ");

    return `
        <div class="d-flex justify-content-between gap-2 small py-1">
            <span>${escaparHtml(item.produto)}</span>
            <span class="text-muted text-end">${escaparHtml(detalhes)}</span>
        </div>
    `;
}

function lerItens() {
    return Array.from(document.querySelectorAll("#itens-ficha tr"))
        .map((tr) => ({
            categoria: tr.querySelector(".campo-categoria").value,
            produto: tr.querySelector(".campo-produto").value.trim(),
            unidadeMedida: tr.querySelector(".campo-unidade").value,
            quantidadePerCapita: lerNumeroDaLinha(tr, ".campo-qtd-p"),
            quantidadeTotal: lerNumeroDaLinha(tr, ".campo-qtd-t"),
            fatorCorrecao: lerNumeroDaLinha(tr, ".campo-fc"),
            indiceCoccao: lerNumeroDaLinha(tr, ".campo-ic"),
            quantidadeCompra: lerNumeroDaLinha(tr, ".campo-qt-compra"),
            valorUnitario: lerNumeroDaLinha(tr, ".campo-rs-unitario"),
            valorParcial: lerNumeroDaLinha(tr, ".campo-rs-parcial")
        }))
        .filter(item => item.produto);
}

function agruparPorCategoria(itens) {
    return itens.reduce((grupos, item) => {
        const categoria = item.categoria || "Outros";
        if (!grupos[categoria]) grupos[categoria] = [];
        grupos[categoria].push(item);
        return grupos;
    }, {});
}

function atualizarParcial(tr) {
    const quantidadeCompra = lerNumeroDaLinha(tr, ".campo-qt-compra");
    const valorUnitario = lerNumeroDaLinha(tr, ".campo-rs-unitario");
    const campoParcial = tr.querySelector(".campo-rs-parcial");

    if (quantidadeCompra && valorUnitario) {
        campoParcial.value = (quantidadeCompra * valorUnitario).toFixed(2);
    }
}

function limparFormulario() {
    [
        "ficha_nome",
        "ficha_rendimento",
        "ficha_numero_porcoes",
        "ficha_rs_porcao",
        "ficha_rs_total",
        "ficha_pre_preparo",
        "ficha_modo_preparo"
    ].forEach(id => document.getElementById(id).value = "");

    document.getElementById("itens-ficha").innerHTML = "";
    adicionarLinhaItem({
        categoria: "Secos",
        fatorCorrecao: 1,
        indiceCoccao: 1
    });
}

function lerNumero(id) {
    const valor = document.getElementById(id).value;
    return valor === "" ? 0 : Number(valor);
}

function lerNumeroDaLinha(tr, seletor) {
    const valor = tr.querySelector(seletor).value;
    return valor === "" ? 0 : Number(valor);
}

function formatarMoeda(valor) {
    if (!valor) return "-";
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarNumero(valor) {
    if (!valor) return "-";
    return Number(valor).toLocaleString("pt-BR", {
        maximumFractionDigits: 4
    });
}

function escaparHtml(valor) {
    const div = document.createElement("div");
    div.textContent = String(valor ?? "");
    return div.innerHTML;
}
