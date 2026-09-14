import { add, getAll, put, remove } from '../js/db.js';
//fichastecnicas.js
const CATEGORIAS = [
    "Secos",
    "Hortifruti",
    "Carnes",
    "Laticinios",
    "Temperos",
    "Outros"
];

const UNIDADES = ["kg", "g", "L", "ml", "un", "pct", "cx"];

let fichaEditandoId = null;
let fichasCadastradas = [];
let insumosCadastrados = [];

export function render() {
    return `
        <style>
            .modal-edicao-ficha {
                position: fixed;
                inset: 0;
                z-index: 1050;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }

            .modal-edicao-ficha.d-none {
                display: none !important;
            }

            .modal-backdrop-custom {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.55);
            }

            .modal-card-custom {
                position: relative;
                z-index: 1051;
                width: min(1100px, 95vw);
                max-height: 92vh;
                overflow-y: auto;
            }

            .modal-card-custom .table-responsive {
                max-height: 400px;
                overflow-y: auto;
            }
        </style>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h2 class="mb-0">Fichas técnicas</h2>
                <p class="text-muted mb-0">
                    Cadastre receitas padronizadas com rendimento, porções e insumos.
                </p>
            </div>

            <button
                class="btn btn-outline-secondary"
                onclick="navigate('/')"
            >
                Voltar ao início
            </button>
        </div>

        <!-- FORMULÁRIO PRINCIPAL - NOVA FICHA -->
        <div class="card p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                <h5 id="titulo-form-ficha" class="mb-0">
                    Nova ficha técnica
                </h5>

                <button
                    id="btn-adicionar-item"
                    class="btn btn-outline-success btn-sm"
                >
                    Adicionar item
                </button>
            </div>

            <div class="row g-3">
                <div class="col-lg-6">
                    <label class="form-label" for="ficha_nome">
                        Nome do preparo
                    </label>

                    <input
                        id="ficha_nome"
                        class="form-control"
                        placeholder="Ex.: Proteína de soja com moranga"
                    >
                </div>

                <div class="col-lg-3">
                    <label class="form-label" for="ficha_cozinha">
                        Cozinha
                    </label>

                    <select
                        id="ficha_cozinha"
                        class="form-select"
                    >
                        <option value="">
                            Carregando cozinhas...
                        </option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label class="form-label" for="ficha_rendimento">
                        Rendimento
                    </label>

                    <input
                        id="ficha_rendimento"
                        class="form-control"
                        placeholder="Ex.: 650 porções"
                    >
                </div>

                <div class="col-md-3">
                    <label class="form-label" for="ficha_numero_porcoes">
                        Número de porções
                    </label>

                    <input
                        id="ficha_numero_porcoes"
                        class="form-control"
                        type="number"
                        min="0"
                        step="1"
                    >
                </div>

                <div class="col-md-3">
                    <label class="form-label" for="ficha_rs_porcao">
                        R$ porção
                    </label>

                    <input
                        id="ficha_rs_porcao"
                        class="form-control"
                        type="number"
                        min="0"
                        step="0.01"
                    >
                </div>

                <div class="col-md-3">
                    <label class="form-label" for="ficha_rs_total">
                        R$ total
                    </label>

                    <input
                        id="ficha_rs_total"
                        class="form-control"
                        type="number"
                        min="0"
                        step="0.01"
                        readonly
                    >
                </div>
                  

                <div class="col-md-6">
                    <label class="form-label" for="ficha_pre_preparo">
                        Pré preparo
                    </label>

                    <input
                        id="ficha_pre_preparo"
                        class="form-control"
                        placeholder="Ex.: higienizar, cortar, hidratar"
                    >
                </div>

                <div class="col-12">
                    <label class="form-label" for="ficha_modo_preparo">
                        Modo de preparo / observações
                    </label>

                    <textarea
                        id="ficha_modo_preparo"
                        class="form-control"
                        rows="3"
                    ></textarea>
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
                            <th>PB</th>
                            <th>PL</th>
                            <th>PC</th>
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
                <button
                    id="btn-limpar-ficha"
                    class="btn btn-outline-secondary"
                >
                    Limpar
                </button>

                <button
                    id="btn-salvar-ficha"
                    class="btn btn-success"
                >
                    Salvar ficha técnica
                </button>
            </div>
        </div>

        <!-- LISTA DE FICHAS -->
        <div id="lista-fichas"></div>

        <!-- MODAL/CARD DE EDIÇÃO -->
        <div id="modal-edicao-ficha" class="modal-edicao-ficha d-none">
            <div
                class="modal-backdrop-custom"
                onclick="fecharModalFicha()"
            ></div>

            <div class="card modal-card-custom shadow-lg">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        Editar ficha técnica
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        onclick="fecharModalFicha()"
                        aria-label="Fechar"
                    ></button>
                </div>

                <div
                    class="card-body"
                    id="conteudo-edicao-ficha"
                ></div>
            </div>
        </div>
    `;
}

    async function carregarCozinhas() {
        const destinos = await getAll("destinos");

        const select =
            document.getElementById("ficha_cozinha");

        if (!select) return;

        if (!destinos.length) {
            select.innerHTML = `
                <option value="">
                    Nenhuma cozinha cadastrada
                </option>
            `;
            return;
        }

        select.innerHTML = `
            <option value="">
                Selecione uma cozinha
            </option>
            ${destinos.map(destino => `
                <option value="${destino.id}">
                    ${escaparHtml(destino.nome)}
                </option>
            `).join("")}
        `;
    }

export async function afterRender() {
    await carregarInsumos();
    await carregarCozinhas();

    document
        .getElementById("btn-adicionar-item")
        .addEventListener("click", adicionarLinhaItem);

    document
        .getElementById("btn-limpar-ficha")
        .addEventListener("click", limparFormulario);

    document
        .getElementById("btn-salvar-ficha")
        .addEventListener("click", salvarFichaTecnica);

    adicionarLinhaItem({
        categoria: "Secos",
        fatorCorrecao: 1,
        indiceCoccao: 1
    });
    document
    .getElementById("ficha_numero_porcoes")
    .addEventListener(
        "input",
        calcularValorTotalFicha
    );

    document
        .getElementById("ficha_rs_porcao")
        .addEventListener(
            "input",
            calcularValorTotalFicha
        );

    calcularValorTotalFicha();
    await atualizarListaFichas();
}


/* =========================================================
   EDITAR FICHA
========================================================= */

window.editarFichaTecnica = function (id) {
    const ficha = fichasCadastradas.find(
        item => item.id === Number(id)
    );

    if (!ficha) return;

    fichaEditandoId = ficha.id;

    const modal = document.getElementById("modal-edicao-ficha");
    const conteudo = document.getElementById("conteudo-edicao-ficha");

    conteudo.innerHTML = renderFormularioEdicao(ficha);

    modal.classList.remove("d-none");

    document
        .getElementById("btn-adicionar-item-edicao")
        .addEventListener("click", () => {
            adicionarLinhaItemEdicao();
        });

    document
        .getElementById("btn-cancelar-edicao")
        .addEventListener("click", fecharModalFicha);

    document
        .getElementById("btn-salvar-edicao")
        .addEventListener("click", salvarEdicaoFicha);

    (ficha.itens || []).forEach(item => {
        adicionarLinhaItemEdicao(item);
    });

    if (!document.getElementById("itens-edicao-ficha").children.length) {
        adicionarLinhaItemEdicao({
            categoria: "Secos",
            fatorCorrecao: 1,
            indiceCoccao: 1
        });
    }
};


function renderFormularioEdicao(ficha) {
    return `
        <div class="row g-3">
            <div class="col-lg-6">
                <label class="form-label">
                    Nome do preparo
                </label>

                <input
                    id="edicao_ficha_nome"
                    class="form-control"
                    value="${escaparHtml(ficha.nome || "")}"
                >
            </div>

            <div class="col-md-3">
                <label class="form-label">
                    Rendimento
                </label>

                <input
                    id="edicao_ficha_rendimento"
                    class="form-control"
                    value="${escaparHtml(ficha.rendimento || "")}"
                >
            </div>

            <div class="col-md-3">
                <label class="form-label">
                    Número de porções
                </label>

                <input
                    id="edicao_ficha_numero_porcoes"
                    class="form-control"
                    type="number"
                    min="0"
                    step="1"
                    value="${ficha.numeroPorcoes ?? ""}"
                >
            </div>

            <div class="col-md-3">
                <label class="form-label">
                    R$ porção
                </label>

                <input
                    id="edicao_ficha_rs_porcao"
                    class="form-control"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${ficha.rsPorcao ?? ""}"
                >
            </div>

            <div class="col-md-3">
                <label class="form-label">
                    R$ total
                </label>

                <input
                    id="edicao_ficha_rs_total"
                    class="form-control"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${ficha.rsTotal ?? ""}"
                >
            </div>

            <div class="col-md-6">
                <label class="form-label">
                    Pré preparo
                </label>

                <input
                    id="edicao_ficha_pre_preparo"
                    class="form-control"
                    value="${escaparHtml(ficha.prePreparo || "")}"
                >
            </div>

            <div class="col-12">
                <label class="form-label">
                    Modo de preparo / observações
                </label>

                <textarea
                    id="edicao_ficha_modo_preparo"
                    class="form-control"
                    rows="3"
                >${escaparHtml(ficha.modoPreparo || "")}</textarea>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 mb-2">
            <h6 class="mb-0">
                Ingredientes / produtos
            </h6>

            <button
                id="btn-adicionar-item-edicao"
                type="button"
                class="btn btn-outline-success btn-sm"
            >
                Adicionar item
            </button>
        </div>

        <div class="table-responsive">
            <table class="table table-sm align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Grupo</th>
                        <th>Produto</th>
                        <th>Un.</th>
                        <th>Qtdade P</th>
                        <th>Qtdade T</th>
                        <th>PB</th>
                        <th>PL</th>
                        <th>PC</th>
                        <th>FC</th>
                        <th>IC</th>
                        <th>Qt. compra</th>
                        <th>R$ unit.</th>
                        <th>R$ parcial</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody id="itens-edicao-ficha"></tbody>
            </table>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
            <button
                id="btn-cancelar-edicao"
                type="button"
                class="btn btn-outline-secondary"
            >
                Cancelar
            </button>

            <button
                id="btn-salvar-edicao"
                type="button"
                class="btn btn-success"
            >
                Atualizar ficha técnica
            </button>
        </div>
    `;
}


function adicionarLinhaItemEdicao(item = {}) {
    const tbody = document.getElementById("itens-edicao-ficha");

    if (!tbody) return;

    const tr = document.createElement("tr");

    const opcoesProdutos = montarOpcoesProdutos(item.produto);

    tr.innerHTML = `
        <td>
            <select class="form-select form-select-sm campo-categoria">
                ${CATEGORIAS.map(categoria => `
                    <option
                        value="${categoria}"
                        ${item.categoria === categoria ? "selected" : ""}
                    >
                        ${categoria}
                    </option>
                `).join("")}
            </select>
        </td>

        <td>
            <select class="form-select form-select-sm campo-produto">
                ${opcoesProdutos}
            </select>
        </td>

        <td>
            <select class="form-select form-select-sm campo-unidade">
                ${UNIDADES.map(unidade => `
                    <option
                        value="${unidade}"
                        ${item.unidadeMedida === unidade ? "selected" : ""}
                    >
                        ${unidade}
                    </option>
                `).join("")}
            </select>
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-qtd-p"
                type="number"
                min="0"
                step="0.0001"
                value="${item.quantidadePerCapita ?? ""}"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-qtd-t"
                type="number"
                min="0"
                step="0.0001"
                value="${item.quantidadeTotal ?? ""}"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-pb"
                type="number"
                min="0"
                step="0.0001"
                value="${item.pesoBruto ?? ""}"
                title="Peso Bruto"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-pl"
                type="number"
                min="0"
                step="0.0001"
                value="${item.pesoLiquido ?? ""}"
                title="Peso Liquido"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-pc"
                type="number"
                min="0"
                step="0.0001"
                value="${item.pesoCozido ?? ""}"
                title="Peso Cozido"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-fc"
                type="number"
                min="0"
                step="0.0001"
                value="${item.fatorCorrecao ?? ""}"
                title="FC = PB / PL"
                readonly
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-ic"
                type="number"
                min="0"
                step="0.0001"
                value="${item.indiceCoccao ?? ""}"
                title="IC = PC / PL"
                readonly
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-qt-compra"
                type="number"
                min="0"
                step="0.0001"
                value="${item.quantidadeCompra ?? ""}"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-rs-unitario"
                type="number"
                min="0"
                step="0.01"
                value="${item.valorUnitario ?? ""}"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-rs-parcial"
                type="number"
                min="0"
                step="0.01"
                value="${item.valorParcial ?? ""}"
            >
        </td>

        <td>
            <button
                class="btn btn-outline-danger btn-sm btn-remover-item"
                type="button"
            >
                Remover
            </button>
        </td>
    `;

    tr.querySelector(".campo-produto").value = item.produto || "";

    tr.querySelector(".btn-remover-item")
        .addEventListener("click", () => {
            tr.remove();

            if (!tbody.children.length) {
                adicionarLinhaItemEdicao({
                    categoria: "Secos",
                    fatorCorrecao: 1,
                    indiceCoccao: 1
                });
            }
        });

    tr.querySelector(".campo-produto")
        .addEventListener("change", () => {
            preencherDadosDoInsumo(tr);
        });

    [
        "campo-pb",
        "campo-pl",
        "campo-pc"
    ].forEach(classe => {
        tr.querySelector(`.${classe}`)
            .addEventListener("input", () => {
                calcularFatores(tr);
            });
    });

    [
        "campo-qt-compra",
        "campo-rs-unitario"
    ].forEach(classe => {
        tr.querySelector(`.${classe}`)
            .addEventListener("input", () => {
                atualizarParcial(tr);
            });
    });

    tbody.appendChild(tr);
}


/* =========================================================
   SALVAR EDIÇÃO
========================================================= */

async function salvarEdicaoFicha() {
    try {
        if (!fichaEditandoId) {
            return;
        }

        const fichaAtual = fichasCadastradas.find(
            item => item.id === fichaEditandoId
        );

        if (!fichaAtual) {
            alert("Ficha técnica não encontrada.");
            return;
        }

        const nome = document
            .getElementById("edicao_ficha_nome")
            .value
            .trim();

        const itens = lerItensEdicao();

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
                cozinha_id:
                Number(
                    document.getElementById("ficha_cozinha").value
                ),

            cozinha:
                document
                    .getElementById("ficha_cozinha")
                    .selectedOptions[0]?.text || "",

            rendimento:
                document
                    .getElementById("ficha_rendimento")
                    .value
                    .trim(),

            numeroPorcoes:
                lerNumero("ficha_numero_porcoes"),

            rsPorcao:
                lerNumero("ficha_rs_porcao"),

            rsTotal:
                calcularTotalFicha(
                    lerNumero("ficha_rs_porcao"),
                    lerNumero("ficha_numero_porcoes")
                ),

            prePreparo:
                document
                    .getElementById("ficha_pre_preparo")
                    .value
                    .trim(),

            modoPreparo:
                document
                    .getElementById("ficha_modo_preparo")
                    .value
                    .trim(),
            
            itens,
            criadoEm: new Date().toISOString()
        };

        if (fichaEditandoId) {
            const fichaAtual =
                fichasCadastradas.find(
                    item => item.id === fichaEditandoId
                );

            ficha.id = fichaEditandoId;

            ficha.criadoEm =
                fichaAtual?.criadoEm ||
                ficha.criadoEm;

            ficha.atualizadoEm =
                new Date().toISOString();

            await put(
                "fichasTecnicas",
                ficha
            );
        } else {
            await add(
                "fichasTecnicas",
                ficha
            );
        }
       // await put("fichasTecnicas", ficha);

        //fecharModalFicha();

        //await atualizarListaFichas();

        alert("Ficha técnica atualizada com sucesso!");
    } catch (error) {
        console.error(
            "Erro ao atualizar ficha técnica:",
            error
        );

        alert(
            "Não foi possível atualizar a ficha técnica."
        );
    }
}


function lerItensEdicao() {
    return Array.from(
        document.querySelectorAll("#itens-edicao-ficha tr")
    )
        .map(tr => ({
            categoria:
                tr.querySelector(".campo-categoria").value,

            produto:
                tr.querySelector(".campo-produto").value.trim(),

            unidadeMedida:
                tr.querySelector(".campo-unidade").value,

            quantidadePerCapita:
                lerNumeroDaLinha(
                    tr,
                    ".campo-qtd-p"
                ),

            quantidadeTotal:
                lerNumeroDaLinha(
                    tr,
                    ".campo-qtd-t"
                ),

            pesoBruto:
                lerNumeroDaLinha(
                    tr,
                    ".campo-pb"
                ),

            pesoLiquido:
                lerNumeroDaLinha(
                    tr,
                    ".campo-pl"
                ),

            pesoCozido:
                lerNumeroDaLinha(
                    tr,
                    ".campo-pc"
                ),

            fatorCorrecao:
                lerNumeroDaLinha(
                    tr,
                    ".campo-fc"
                ),

            indiceCoccao:
                lerNumeroDaLinha(
                    tr,
                    ".campo-ic"
                ),

            quantidadeCompra:
                lerNumeroDaLinha(
                    tr,
                    ".campo-qt-compra"
                ),

            valorUnitario:
                lerNumeroDaLinha(
                    tr,
                    ".campo-rs-unitario"
                ),

            valorParcial:
                lerNumeroDaLinha(
                    tr,
                    ".campo-rs-parcial"
                )
        }))
        .filter(item => item.produto);
}


/* =========================================================
   FECHAR MODAL
========================================================= */

window.fecharModalFicha = function () {
    const modal = document.getElementById(
        "modal-edicao-ficha"
    );

    const conteudo = document.getElementById(
        "conteudo-edicao-ficha"
    );

    if (!modal) return;

    modal.classList.add("d-none");

    if (conteudo) {
        conteudo.innerHTML = "";
    }

    fichaEditandoId = null;
};


/* =========================================================
   EXCLUIR FICHA
========================================================= */

window.excluirFichaTecnica = async function (id) {
    const ficha = fichasCadastradas.find(
        item => item.id === Number(id)
    );

    if (!ficha) return;

    const confirmar = confirm(
        `Deseja realmente excluir a ficha "${ficha.nome}"?`
    );

    if (!confirmar) return;

    try {
        await remove(
            "fichasTecnicas",
            Number(id)
        );

        await atualizarListaFichas();

        alert(
            "Ficha técnica excluída com sucesso!"
        );
    } catch (error) {
        console.error(
            "Erro ao excluir ficha técnica:",
            error
        );

        alert(
            "Não foi possível excluir a ficha técnica."
        );
    }
};


/* =========================================================
   ADICIONAR ITEM - FORMULÁRIO PRINCIPAL
========================================================= */

function adicionarLinhaItem(item = {}) {
    const tbody = document.getElementById("itens-ficha");

    const tr = document.createElement("tr");

    const opcoesProdutos = montarOpcoesProdutos(
        item.produto
    );

    tr.innerHTML = `
        <td>
            <select class="form-select form-select-sm campo-categoria">
                ${CATEGORIAS.map(categoria => `
                    <option
                        value="${categoria}"
                        ${item.categoria === categoria ? "selected" : ""}
                    >
                        ${categoria}
                    </option>
                `).join("")}
            </select>
        </td>

        <td>
            <select class="form-select form-select-sm campo-produto">
                ${opcoesProdutos}
            </select>
        </td>

        <td>
            <select class="form-select form-select-sm campo-unidade">
                ${UNIDADES.map(unidade => `
                    <option
                        value="${unidade}"
                        ${item.unidadeMedida === unidade ? "selected" : ""}
                    >
                        ${unidade}
                    </option>
                `).join("")}
            </select>
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-qtd-p"
                type="number"
                min="0"
                step="0.0001"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-qtd-t"
                type="number"
                min="0"
                step="0.0001"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-pb"
                type="number"
                min="0"
                step="0.0001"
                title="Peso Bruto"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-pl"
                type="number"
                min="0"
                step="0.0001"
                title="Peso Liquido"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-pc"
                type="number"
                min="0"
                step="0.0001"
                title="Peso Cozido"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-fc"
                type="number"
                min="0"
                step="0.0001"
                title="FC = PB / PL"
                readonly
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-ic"
                type="number"
                min="0"
                step="0.0001"
                title="IC = PC / PL"
                readonly
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-qt-compra"
                type="number"
                min="0"
                step="0.0001"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-rs-unitario"
                type="number"
                min="0"
                step="0.01"
            >
        </td>

        <td>
            <input
                class="form-control form-control-sm campo-rs-parcial"
                type="number"
                min="0"
                step="0.01"
            >
        </td>

        <td>
            <button
                class="btn btn-outline-danger btn-sm btn-remover-item"
                type="button"
            >
                Remover
            </button>
        </td>
    `;

    tr.querySelector(".campo-produto").value =
        item.produto || "";

    tr.querySelector(".campo-qtd-p").value =
        item.quantidadePerCapita || "";

    tr.querySelector(".campo-qtd-t").value =
        item.quantidadeTotal || "";

    tr.querySelector(".campo-pb").value =
        item.pesoBruto || "";

    tr.querySelector(".campo-pl").value =
        item.pesoLiquido || "";

    tr.querySelector(".campo-pc").value =
        item.pesoCozido || "";

    tr.querySelector(".campo-fc").value =
        item.fatorCorrecao || "";

    tr.querySelector(".campo-ic").value =
        item.indiceCoccao || "";

    tr.querySelector(".campo-qt-compra").value =
        item.quantidadeCompra || "";

    tr.querySelector(".campo-rs-unitario").value =
        item.valorUnitario || "";

    tr.querySelector(".campo-rs-parcial").value =
        item.valorParcial || "";

    tr.querySelector(".btn-remover-item")
        .addEventListener("click", () => {
            tr.remove();

            if (!tbody.children.length) {
                adicionarLinhaItem({
                    categoria: "Secos",
                    fatorCorrecao: 1,
                    indiceCoccao: 1
                });
            }
        });

    tr.querySelector(".campo-produto")
        .addEventListener("change", () => {
            preencherDadosDoInsumo(tr);
        });

    [
        "campo-pb",
        "campo-pl",
        "campo-pc"
    ].forEach(classe => {
        tr.querySelector(`.${classe}`)
            .addEventListener("input", () => {
                calcularFatores(tr);
            });
    });

    [
        "campo-qt-compra",
        "campo-rs-unitario"
    ].forEach(classe => {
        tr.querySelector(`.${classe}`)
            .addEventListener("input", () => {
                atualizarParcial(tr);
            });
    });

    tbody.appendChild(tr);
}


/* =========================================================
   SALVAR NOVA FICHA
========================================================= */

async function salvarFichaTecnica() {
    try {
        const nome =
            document
                .getElementById("ficha_nome")
                .value
                .trim();

        const cozinhaId =
            document
                .getElementById("ficha_cozinha")
                .value;

        const itens = lerItens();

        if (!nome) {
            alert(
                "Informe o nome do preparo."
            );
            return;
        }

        if (!itens.length) {
            alert(
                "Informe ao menos um produto da ficha técnica."
            );
            return;
        }

        const ficha = {
            nome,
            cozinha_id: Number(cozinhaId),

            cozinha:
                document
                    .getElementById("ficha_cozinha")
                    .selectedOptions[0]?.text || "",
                    
            rendimento:
                document
                    .getElementById("ficha_rendimento")
                    .value
                    .trim(),

            numeroPorcoes:
                lerNumero("ficha_numero_porcoes"),

            rsPorcao:
                lerNumero("ficha_rs_porcao"),

            rsTotal:
                calcularTotalFicha(
                    lerNumero("ficha_rs_porcao"),
                    lerNumero("ficha_numero_porcoes")
                ),

            prePreparo:
                document
                    .getElementById("ficha_pre_preparo")
                    .value
                    .trim(),

            modoPreparo:
                document
                    .getElementById("ficha_modo_preparo")
                    .value
                    .trim(),

            itens,

            criadoEm:
                new Date().toISOString()
        };

        if (fichaEditandoId) {
            const fichaAtual =
                fichasCadastradas.find(
                    item =>
                        item.id === fichaEditandoId
                );

            ficha.id =
                fichaEditandoId;

            ficha.criadoEm =
                fichaAtual?.criadoEm ||
                ficha.criadoEm;

            ficha.atualizadoEm =
                new Date().toISOString();

            await put(
                "fichasTecnicas",
                ficha
            );
        } else {
            await add(
                "fichasTecnicas",
                ficha
            );
        }

        limparFormulario();

        await atualizarListaFichas();

    } catch (error) {
        console.error(
            "Erro ao salvar ficha técnica:",
            error
        );

        alert(
            "Não foi possível salvar a ficha técnica."
        );
    }
}

/* =========================================================
   LISTA DE FICHAS
========================================================= */

async function atualizarListaFichas() {
    const fichas = await getAll(
        "fichasTecnicas"
    );

    fichasCadastradas = fichas;

    const lista =
        document.getElementById(
            "lista-fichas"
        );

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
            <h4 class="mb-0">
                Fichas cadastradas
            </h4>

            <span class="badge text-bg-danger">
                ${fichas.length}
            </span>
        </div>

        <div class="row g-3">
            ${fichas
                .slice()
                .reverse()
                .map(renderCardFicha)
                .join("")}
        </div>
    `;
}


/* =========================================================
   CARD DA FICHA
========================================================= */

function renderCardFicha(ficha) {
    const itensPorCategoria =
        agruparPorCategoria(
            ficha.itens || []
        );

    return `
        <div class="col-xl-4 col-lg-6">
            <div class="card h-100 shadow-sm">
                <div class="card-body">

                    <div class="d-flex justify-content-between gap-3 mb-2">
                        <h5 class="card-title mb-0">
                            ${escaparHtml(ficha.nome)}
                        </h5>

                        <span class="badge text-bg-light border">
                            ${(ficha.itens || []).length} itens
                        </span>
                    </div>

                    <div class="row g-2 text-center mb-3">
                        ${renderIndicador(
                            "Rendimento",
                            ficha.rendimento || "-"
                        )}

                        ${renderIndicador(
                            "Porções",
                            ficha.numeroPorcoes || "-"
                        )}

                        ${renderIndicador(
                            "R$ porção",
                            formatarMoeda(ficha.rsPorcao)
                        )}

                        ${renderIndicador(
                            "R$ total",
                            formatarMoeda(ficha.rsTotal)
                        )}
                    </div>

                    ${
                        ficha.prePreparo
                            ? `
                                <p class="small mb-2">
                                    <strong>
                                        Pré preparo:
                                    </strong>

                                    ${escaparHtml(
                                        ficha.prePreparo
                                    )}
                                </p>
                            `
                            : ""
                    }

                    ${Object.entries(
                        itensPorCategoria
                    )
                        .map(
                            ([categoria, itens]) => `
                                <div class="mb-3">
                                    <div
                                        class="fw-semibold text-success border-bottom pb-1 mb-2"
                                    >
                                        ${escaparHtml(
                                            categoria
                                        )}
                                    </div>

                                    ${itens
                                        .map(renderItemFicha)
                                        .join("")}
                                </div>
                            `
                        )
                        .join("")}

                    ${
                        ficha.modoPreparo
                            ? `
                                <p class="small text-muted mb-0">
                                    ${escaparHtml(
                                        ficha.modoPreparo
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <!-- BOTÕES EDITAR / EXCLUIR -->
                    <div class="d-flex justify-content-end gap-2 mt-3">

                        <button
                            class="btn btn-outline-primary btn-sm"
                            onclick="editarFichaTecnica(${ficha.id})"
                            type="button"
                            title="Editar ficha"
                        >
                            ✏️
                        </button>

                        <button
                            class="btn btn-outline-danger btn-sm"
                            onclick="excluirFichaTecnica(${ficha.id})"
                            type="button"
                            title="Excluir ficha"
                        >
                            🗑️
                        </button>

                    </div>

                </div>
            </div>
        </div>
    `;
}


function renderIndicador(rotulo, valor) {
    return `
        <div class="col-6">
            <div class="border rounded p-2 bg-light h-100">
                <div class="small text-muted">
                    ${rotulo}
                </div>

                <div class="fw-semibold">
                    ${escaparHtml(valor)}
                </div>
            </div>
        </div>
    `;
}


function renderItemFicha(item) {
    const detalhes = [
        item.quantidadePerCapita
            ? `${formatarNumero(item.quantidadePerCapita)} ${item.unidadeMedida}/p`
            : "",

        item.quantidadeTotal
            ? `total ${formatarNumero(item.quantidadeTotal)}`
            : "",

        item.pesoBruto
            ? `PB ${formatarNumero(item.pesoBruto)}`
            : "",

        item.pesoLiquido
            ? `PL ${formatarNumero(item.pesoLiquido)}`
            : "",

        item.pesoCozido
            ? `PC ${formatarNumero(item.pesoCozido)}`
            : "",

        item.fatorCorrecao
            ? `FC ${formatarNumero(item.fatorCorrecao)}`
            : "",

        item.indiceCoccao
            ? `IC ${formatarNumero(item.indiceCoccao)}`
            : "",

        item.quantidadeCompra
            ? `compra ${formatarNumero(item.quantidadeCompra)}`
            : "",

        item.valorParcial
            ? formatarMoeda(item.valorParcial)
            : ""
    ]
        .filter(Boolean)
        .join(" | ");

    return `
        <div class="d-flex justify-content-between gap-2 small py-1">
            <span>
                ${escaparHtml(item.produto)}
            </span>

            <span class="text-muted text-end">
                ${escaparHtml(detalhes)}
            </span>
        </div>
    `;
}


/* =========================================================
   LER ITENS DO FORMULÁRIO PRINCIPAL
========================================================= */

function lerItens() {
    return Array.from(
        document.querySelectorAll(
            "#itens-ficha tr"
        )
    )
        .map(tr => ({
            categoria:
                tr.querySelector(
                    ".campo-categoria"
                ).value,

            produto:
                tr.querySelector(
                    ".campo-produto"
                ).value.trim(),

            unidadeMedida:
                tr.querySelector(
                    ".campo-unidade"
                ).value,

            quantidadePerCapita:
                lerNumeroDaLinha(
                    tr,
                    ".campo-qtd-p"
                ),

            quantidadeTotal:
                lerNumeroDaLinha(
                    tr,
                    ".campo-qtd-t"
                ),

            pesoBruto:
                lerNumeroDaLinha(
                    tr,
                    ".campo-pb"
                ),

            pesoLiquido:
                lerNumeroDaLinha(
                    tr,
                    ".campo-pl"
                ),

            pesoCozido:
                lerNumeroDaLinha(
                    tr,
                    ".campo-pc"
                ),

            fatorCorrecao:
                lerNumeroDaLinha(
                    tr,
                    ".campo-fc"
                ),

            indiceCoccao:
                lerNumeroDaLinha(
                    tr,
                    ".campo-ic"
                ),

            quantidadeCompra:
                lerNumeroDaLinha(
                    tr,
                    ".campo-qt-compra"
                ),

            valorUnitario:
                lerNumeroDaLinha(
                    tr,
                    ".campo-rs-unitario"
                ),

            valorParcial:
                lerNumeroDaLinha(
                    tr,
                    ".campo-rs-parcial"
                )
        }))
        .filter(item => item.produto);
}


/* =========================================================
   AGRUPAR CATEGORIAS
========================================================= */

function agruparPorCategoria(itens) {
    return itens.reduce(
        (grupos, item) => {
            const categoria =
                item.categoria || "Outros";

            if (!grupos[categoria]) {
                grupos[categoria] = [];
            }

            grupos[categoria].push(item);

            return grupos;
        },
        {}
    );
}


/* =========================================================
   CALCULAR VALOR PARCIAL
========================================================= */

function calcularFatores(tr) {
    const pesoBruto =
        lerNumeroDaLinha(
            tr,
            ".campo-pb"
        );

    const pesoLiquido =
        lerNumeroDaLinha(
            tr,
            ".campo-pl"
        );

    const pesoCozido =
        lerNumeroDaLinha(
            tr,
            ".campo-pc"
        );

    const campoFc =
        tr.querySelector(
            ".campo-fc"
        );

    const campoIc =
        tr.querySelector(
            ".campo-ic"
        );

    campoFc.value =
        pesoBruto && pesoLiquido
            ? (pesoBruto / pesoLiquido).toFixed(4)
            : "";

    campoIc.value =
        pesoCozido && pesoLiquido
            ? (pesoCozido / pesoLiquido).toFixed(4)
            : "";
}

function atualizarParcial(tr) {
    const quantidadeCompra =
        lerNumeroDaLinha(
            tr,
            ".campo-qt-compra"
        );

    const valorUnitario =
        lerNumeroDaLinha(
            tr,
            ".campo-rs-unitario"
        );

    const campoParcial =
        tr.querySelector(
            ".campo-rs-parcial"
        );

    if (
        quantidadeCompra &&
        valorUnitario
    ) {
        campoParcial.value =
            (
                quantidadeCompra *
                valorUnitario
            ).toFixed(2);
    } else {
        campoParcial.value = "";
    }
}

function calcularTotalFicha(rsPorcao, numeroPorcoes) {
    const porcao = Number(rsPorcao) || 0;
    const porcoes = Number(numeroPorcoes) || 0;

    return Number(
        (porcao * porcoes).toFixed(2)
    );
}
// valor total da ficha técnica

function calcularValorTotalFicha() {
    const rsPorcao =
        lerNumero("ficha_rs_porcao");

    const numeroPorcoes =
        lerNumero("ficha_numero_porcoes");

    const campoTotal =
        document.getElementById(
            "ficha_rs_total"
        );

    if (!campoTotal) return;

    campoTotal.value =
        calcularTotalFicha(
            rsPorcao,
            numeroPorcoes
        ).toFixed(2);
}

/* =========================================================
   LIMPAR FORMULÁRIO PRINCIPAL
========================================================= */

function limparFormulario() {
    fichaEditandoId = null;

    document.getElementById(
        "titulo-form-ficha"
    ).textContent =
        "Nova ficha técnica";

    document.getElementById(
        "btn-salvar-ficha"
    ).textContent =
        "Salvar ficha técnica";

    [
        "ficha_nome",
        "ficha_rendimento",
        "ficha_numero_porcoes",
        "ficha_rs_porcao",
        "ficha_rs_total",
        "ficha_pre_preparo",
        "ficha_modo_preparo"
    ].forEach(id => {
        document.getElementById(id).value = "";
    });

    document.getElementById(
        "itens-ficha"
    ).innerHTML = "";

    adicionarLinhaItem({
        categoria: "Secos",
        fatorCorrecao: 1,
        indiceCoccao: 1
    });
}


/* =========================================================
   CARREGAR INSUMOS
========================================================= */

async function carregarInsumos() {
    const [
        insumos,
        entradas
    ] = await Promise.all([
        getAll("insumos"),
        getAll("entradas")
    ]);

    const mapa = new Map();

    insumos.forEach(insumo => {
        const chave =
            normalizarTexto(
                insumo.nome
            );

        if (!chave) return;

        mapa.set(chave, {
            nome: insumo.nome,
            categoria:
                insumo.categoria ||
                "Outros",
            unidade:
                normalizarUnidade(
                    insumo.unidade
                )
        });
    });

    entradas.forEach(entrada => {
        const chave =
            normalizarTexto(
                entrada.nome
            );

        if (
            !chave ||
            mapa.has(chave)
        ) {
            return;
        }

        mapa.set(chave, {
            nome: entrada.nome,
            categoria: "Outros",
            unidade:
                normalizarUnidade(
                    entrada.unidade
                )
        });
    });

    insumosCadastrados =
        Array.from(mapa.values())
            .sort(
                (a, b) =>
                    String(a.nome || "")
                        .localeCompare(
                            String(b.nome || ""),
                            "pt-BR"
                        )
            );
}


/* =========================================================
   OPÇÕES DE PRODUTOS
========================================================= */

function montarOpcoesProdutos(
    produtoAtual = ""
) {
    const nomes = new Set(
        insumosCadastrados
            .map(item => item.nome)
            .filter(Boolean)
    );

    const opcoes = [
        `<option value="">
            Selecione um ingrediente cadastrado
        </option>`
    ];

    if (
        produtoAtual &&
        !nomes.has(produtoAtual)
    ) {
        opcoes.push(`
            <option value="${escaparHtml(produtoAtual)}">
                ${escaparHtml(produtoAtual)}
            </option>
        `);
    }

    insumosCadastrados.forEach(
        insumo => {
            opcoes.push(`
                <option
                    value="${escaparHtml(insumo.nome)}"
                >
                    ${escaparHtml(insumo.nome)}
                </option>
            `);
        }
    );

    return opcoes.join("");
}


/* =========================================================
   PREENCHER DADOS DO INSUMO
========================================================= */

function preencherDadosDoInsumo(tr) {
    const produto =
        tr.querySelector(
            ".campo-produto"
        ).value;

    const insumo =
        insumosCadastrados.find(
            item =>
                item.nome === produto
        );

    if (!insumo) return;

    if (insumo.categoria) {
        tr.querySelector(
            ".campo-categoria"
        ).value =
            insumo.categoria;
    }

    if (insumo.unidade) {
        tr.querySelector(
            ".campo-unidade"
        ).value =
            insumo.unidade;
    }
}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toUpperCase()
        .trim();
}


function normalizarUnidade(unidade) {
    const mapa = {
        QUILO: "kg",
        QUILOS: "kg",
        KG: "kg",
        GRAMA: "g",
        GRAMAS: "g",
        G: "g",
        LITRO: "L",
        LITROS: "L",
        L: "L",
        ML: "ml",
        UNIDADE: "un",
        UNIDADES: "un",
        UN: "un"
    };

    return (
        mapa[
            normalizarTexto(unidade)
        ] ||
        unidade ||
        "kg"
    );
}


function lerNumero(id) {
    const valor =
        document.getElementById(id)
            .value;

    return valor === ""
        ? 0
        : Number(valor);
}


function lerNumeroElemento(id) {
    const elemento =
        document.getElementById(id);

    if (!elemento) return 0;

    const valor =
        elemento.value;

    return valor === ""
        ? 0
        : Number(valor);
}


function lerNumeroDaLinha(
    tr,
    seletor
) {
    const valor =
        tr.querySelector(
            seletor
        ).value;

    return valor === ""
        ? 0
        : Number(valor);
}


function formatarMoeda(valor) {
    if (!valor) return "-";

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}


function formatarNumero(valor) {
    if (!valor) return "-";

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                maximumFractionDigits: 4
            }
        );
}


function escaparHtml(valor) {
    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(valor ?? "");

    return div.innerHTML;
}
