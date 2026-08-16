import { add, getAll, put, remove } from '../js/db.js';
import { importarExcel } from '../utils/excel.js';
import { aplicarMascaraData, formatarData } from '../utils/data.js';

let produtosCadastrados = [];
let saidasCadastradas = [];
let destinosCadastrados = [];
let beneficiadosCadastrados = [];


window.importarSaidaArquivo =
    async function (file) {
        await importarExcel(
            file,
            "saida"
        );

        await atualizarLista();
    };


export function render() {
    return `
        <style>
            .modal-edicao {
                position: fixed;
                inset: 0;
                z-index: 1050;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }

            .modal-edicao.d-none {
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
                width: min(850px, 95vw);
                max-height: 90vh;
                overflow-y: auto;
            }
        </style>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">
                Saídas
            </h2>

            <button
                class="btn btn-outline-secondary"
                onclick="navigate('/')"
            >
                Voltar ao início
            </button>
        </div>

        <div class="row g-2">

            <div class="col-md-3">
                <label
                    class="form-label"
                    for="data"
                >
                    Data saida
                </label>

                <input
                    id="data"
                    class="form-control"
                    placeholder="dd/mm/aaaa"
                >
            </div>

            <div class="col-md-3">
                <label
                    class="form-label"
                    for="tipo_saida"
                >
                    Tipo de destino
                </label>

                <select
                    id="tipo_saida"
                    class="form-select"
                    onchange="alternarDestinoSaida()"
                >
                    <option value="cozinha">
                        Cozinha
                    </option>

                    <option value="doacao">
                        Doacao
                    </option>
                </select>
            </div>

            <div
                class="col-md-3"
                id="campo_destino"
            >
                <label
                    class="form-label"
                    for="destino"
                >
                    Para onde foi
                </label>

                <select
                    id="destino"
                    class="form-select"
                ></select>
            </div>

            <div
                class="col-md-3 d-none"
                id="campo_beneficiado"
            >
                <label
                    class="form-label"
                    for="beneficiado"
                >
                    Beneficiado
                </label>

                <select
                    id="beneficiado"
                    class="form-select"
                ></select>
            </div>

            <div class="col-md-4">
                <label
                    class="form-label"
                    for="nome"
                >
                    Produto
                </label>

                <select
                    id="nome"
                    class="form-select"
                >
                    <option value="">
                        Selecione um insumo
                    </option>
                </select>
            </div>

            <div class="col-md-2">
                <label
                    class="form-label"
                    for="qtd"
                >
                    Quantidade
                </label>

                <input
                    id="qtd"
                    type="number"
                    step="0.01"
                    class="form-control"
                >
            </div>

            <div class="col-md-2">
                <label
                    class="form-label"
                    for="unidade"
                >
                    Unidade
                </label>

                <select
                    id="unidade"
                    class="form-select"
                >
                    <option value="Quilo">
                        Quilo
                    </option>

                    <option value="Grama">
                        Grama
                    </option>

                    <option value="Duzia">
                        Duzia
                    </option>

                    <option value="Litros">
                        Litros
                    </option>

                    <option value="Unidade">
                        Unidade
                    </option>
                </select>
            </div>

        </div>

        <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onchange="importarSaidaArquivo(this.files[0])"
            class="form-control mt-3 mb-3"
        >

        <button
            class="btn btn-danger"
            onclick="salvar()"
        >
            Registrar saída
        </button>

        <div
            id="lista"
            class="mt-4"
        ></div>


        <!-- CARD DE EDIÇÃO -->
        <div
            id="modal-edicao-saida"
            class="modal-edicao d-none"
        >
            <div
                class="modal-backdrop-custom"
                onclick="fecharModalSaida()"
            ></div>

            <div class="card modal-card-custom shadow-lg">

                <div
                    class="card-header d-flex justify-content-between align-items-center"
                >
                    <h5 class="mb-0">
                        Editar saída
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        onclick="fecharModalSaida()"
                        aria-label="Fechar"
                    ></button>
                </div>

                <div
                    class="card-body"
                    id="conteudo-edicao-saida"
                ></div>

            </div>
        </div>
    `;
}


export async function afterRender() {
    aplicarMascaraData("data");

    await carregarOpcoes();

    document
        .getElementById("nome")
        .addEventListener(
            "change",
            preencherUnidadeProduto
        );

    alternarDestinoSaida();

    await atualizarLista();
}


/* =========================================================
   SALVAR NOVA SAÍDA
========================================================= */

window.salvar =
    async function () {
        try {
            const tipoSaida =
                document.getElementById(
                    "tipo_saida"
                ).value;

            const destinoSelect =
                document.getElementById(
                    "destino"
                );

            const beneficiadoSelect =
                document.getElementById(
                    "beneficiado"
                );

            const destino =
                tipoSaida === "doacao"
                    ? beneficiadoSelect.options[
                        beneficiadoSelect.selectedIndex
                    ]?.text || ""
                    : destinoSelect.options[
                        destinoSelect.selectedIndex
                    ]?.text || "";

            const nomeProduto =
                document.getElementById(
                    "nome"
                ).value;

            const qtd =
                Number(
                    document.getElementById(
                        "qtd"
                    ).value
                );

            if (!nomeProduto) {
                alert(
                    "Informe o produto da saida."
                );
                return;
            }

            const produtoExiste =
                produtosCadastrados.some(
                    p =>
                        normalizarTexto(
                            p.nome
                        ) ===
                        normalizarTexto(
                            nomeProduto
                        )
                );

            if (!produtoExiste) {
                alert(
                    "Selecione um produto cadastrado na lista."
                );
                return;
            }

            if (!destino) {
                alert(
                    tipoSaida === "doacao"
                        ? "Selecione o beneficiado da doação."
                        : "Selecione a cozinha destino."
                );
                return;
            }

            if (
                !Number.isFinite(qtd) ||
                qtd <= 0
            ) {
                alert(
                    "Informe uma quantidade válida maior que zero."
                );
                return;
            }

            await add(
                "saidas",
                {
                    nome:
                        nomeProduto,

                    qtd,

                    unidade:
                        document.getElementById(
                            "unidade"
                        ).value,

                    data:
                        formatarData(
                            document.getElementById(
                                "data"
                            ).value
                        ),

                    destino,

                    tipo_saida:
                        tipoSaida,

                    destino_id:
                        tipoSaida === "cozinha"
                            ? destinoSelect.value
                            : "",

                    beneficiado_id:
                        tipoSaida === "doacao"
                            ? beneficiadoSelect.value
                            : "",

                    tipo: "saida"
                }
            );

            limparFormulario();

            await atualizarLista();

        } catch (err) {
            console.error(
                "Erro ao registrar saída:",
                err
            );

            alert(
                "Erro ao registrar a saída. Abra o console do navegador para ver detalhes."
            );
        }
    };


/* =========================================================
   LISTA
========================================================= */

async function atualizarLista() {
    const dados =
        await getAll("saidas");

    saidasCadastradas =
        dados;

    document.getElementById(
        "lista"
    ).innerHTML =
        dados.length
            ? `
                <div class="table-responsive">

                    <table class="table table-striped table-sm align-middle">

                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Destino</th>
                                <th>Tipo</th>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Unidade</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>

                            ${dados.map(d => `
                                <tr>

                                    <td>
                                        ${formatarData(
                                            d.data
                                        )}
                                    </td>

                                    <td>
                                        ${escaparHtml(
                                            d.destino || ""
                                        )}
                                    </td>

                                    <td>
                                        ${
                                            d.tipo_saida === "doacao"
                                                ? "Doacao"
                                                : "Cozinha"
                                        }
                                    </td>

                                    <td>
                                        ${escaparHtml(
                                            d.nome || ""
                                        )}
                                    </td>

                                    <td>
                                        ${d.qtd || 0}
                                    </td>

                                    <td>
                                        ${escaparHtml(
                                            d.unidade || ""
                                        )}
                                    </td>

                                    <td>
                                        <div class="d-flex gap-1">

                                            <button
                                                class="btn btn-outline-primary btn-sm"
                                                onclick="editarSaida(${d.id})"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="excluirSaida(${d.id})"
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            `).join("")}

                        </tbody>

                    </table>

                </div>
            `
            : `
                <div class="alert alert-info">
                    Nenhuma saída registrada.
                </div>
            `;
}


/* =========================================================
   EDITAR SAÍDA
========================================================= */

window.editarSaida =
    function (id) {
        const saida =
            saidasCadastradas.find(
                item =>
                    item.id ===
                    Number(id)
            );

        if (!saida) {
            alert(
                "Saída não encontrada."
            );
            return;
        }

        const modal =
            document.getElementById(
                "modal-edicao-saida"
            );

        const conteudo =
            document.getElementById(
                "conteudo-edicao-saida"
            );

        conteudo.innerHTML =
            renderFormularioEdicao(
                saida
            );

        modal.classList.remove(
            "d-none"
        );

        aplicarMascaraData(
            "edicao_saida_data"
        );

        document
            .getElementById(
                "edicao_saida_tipo"
            )
            .addEventListener(
                "change",
                alternarDestinoEdicao
            );

        document
            .getElementById(
                "edicao_saida_produto"
            )
            .addEventListener(
                "change",
                preencherUnidadeProdutoEdicao
            );

        alternarDestinoEdicao();

        preencherUnidadeProdutoEdicao();
    };


function renderFormularioEdicao(
    saida
) {
    return `
        <div class="row g-3">

            <div class="col-md-4">
                <label class="form-label">
                    Data saída
                </label>

                <input
                    id="edicao_saida_data"
                    class="form-control"
                    placeholder="dd/mm/aaaa"
                    value="${escaparHtml(
                        formatarData(
                            saida.data
                        )
                    )}"
                >
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Tipo de destino
                </label>

                <select
                    id="edicao_saida_tipo"
                    class="form-select"
                >
                    <option
                        value="cozinha"
                        ${
                            saida.tipo_saida ===
                            "cozinha"
                                ? "selected"
                                : ""
                        }
                    >
                        Cozinha
                    </option>

                    <option
                        value="doacao"
                        ${
                            saida.tipo_saida ===
                            "doacao"
                                ? "selected"
                                : ""
                        }
                    >
                        Doacao
                    </option>
                </select>
            </div>

            <div
                class="col-md-4"
                id="edicao_campo_destino"
            >
                <label class="form-label">
                    Para onde foi
                </label>

                <select
                    id="edicao_saida_destino"
                    class="form-select"
                >
                    ${montarOpcoesSelect(
                        destinosCadastrados,
                        saida.destino_id,
                        "Cadastre uma cozinha primeiro"
                    )}
                </select>
            </div>

            <div
                class="col-md-4 d-none"
                id="edicao_campo_beneficiado"
            >
                <label class="form-label">
                    Beneficiado
                </label>

                <select
                    id="edicao_saida_beneficiado"
                    class="form-select"
                >
                    ${montarOpcoesSelect(
                        beneficiadosCadastrados,
                        saida.beneficiado_id,
                        "Cadastre um beneficiado primeiro"
                    )}
                </select>
            </div>

            <div class="col-md-8">
                <label class="form-label">
                    Produto
                </label>

                <select
                    id="edicao_saida_produto"
                    class="form-select"
                >
                    ${produtosCadastrados.map(
                        produto => `
                            <option
                                value="${escaparHtml(
                                    produto.nome
                                )}"
                                ${
                                    normalizarTexto(
                                        produto.nome
                                    ) ===
                                    normalizarTexto(
                                        saida.nome
                                    )
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escaparHtml(
                                    produto.nome
                                )}
                            </option>
                        `
                    ).join("")}
                </select>
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Quantidade
                </label>

                <input
                    id="edicao_saida_qtd"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    value="${saida.qtd ?? ""}"
                >
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Unidade
                </label>

                <select
                    id="edicao_saida_unidade"
                    class="form-select"
                >
                    ${[
                        "Quilo",
                        "Grama",
                        "Duzia",
                        "Litros",
                        "Unidade"
                    ].map(
                        unidade => `
                            <option
                                value="${unidade}"
                                ${
                                    saida.unidade ===
                                    unidade
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${unidade}
                            </option>
                        `
                    ).join("")}
                </select>
            </div>

        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">

            <button
                type="button"
                class="btn btn-outline-secondary"
                onclick="fecharModalSaida()"
            >
                Cancelar
            </button>

            <button
                type="button"
                class="btn btn-success"
                onclick="salvarEdicaoSaida(${saida.id})"
            >
                Salvar alterações
            </button>

        </div>
    `;
}


/* =========================================================
   SALVAR EDIÇÃO
========================================================= */

window.salvarEdicaoSaida =
    async function (id) {
        const saidaOriginal =
            saidasCadastradas.find(
                item =>
                    item.id ===
                    Number(id)
            );

        if (!saidaOriginal) {
            alert(
                "Saída não encontrada."
            );
            return;
        }

        const tipoSaida =
            document.getElementById(
                "edicao_saida_tipo"
            ).value;

        const destinoSelect =
            document.getElementById(
                "edicao_saida_destino"
            );

        const beneficiadoSelect =
            document.getElementById(
                "edicao_saida_beneficiado"
            );

        const produtoSelect =
            document.getElementById(
                "edicao_saida_produto"
            );

        const nomeProduto =
            produtoSelect.value;

        const qtd =
            Number(
                document.getElementById(
                    "edicao_saida_qtd"
                ).value
            );

        if (!nomeProduto) {
            alert(
                "Selecione o produto."
            );
            return;
        }

        if (
            !Number.isFinite(qtd) ||
            qtd <= 0
        ) {
            alert(
                "Informe uma quantidade válida maior que zero."
            );
            return;
        }

        const destino =
            tipoSaida === "doacao"
                ? beneficiadoSelect.options[
                    beneficiadoSelect.selectedIndex
                ]?.text || ""
                : destinoSelect.options[
                    destinoSelect.selectedIndex
                ]?.text || "";

        if (!destino) {
            alert(
                tipoSaida === "doacao"
                    ? "Selecione o beneficiado da doação."
                    : "Selecione a cozinha destino."
            );
            return;
        }

        const registroAtualizado = {
            ...saidaOriginal,

            nome:
                nomeProduto,

            qtd,

            unidade:
                document.getElementById(
                    "edicao_saida_unidade"
                ).value,

            data:
                formatarData(
                    document.getElementById(
                        "edicao_saida_data"
                    ).value
                ),

            destino,

            tipo_saida:
                tipoSaida,

            destino_id:
                tipoSaida === "cozinha"
                    ? destinoSelect.value
                    : "",

            beneficiado_id:
                tipoSaida === "doacao"
                    ? beneficiadoSelect.value
                    : ""
        };

        try {
            await put(
                "saidas",
                registroAtualizado
            );

            fecharModalSaida();

            await atualizarLista();

            alert(
                "Saída atualizada com sucesso!"
            );

        } catch (error) {
            console.error(
                "Erro ao atualizar saída:",
                error
            );

            alert(
                "Não foi possível atualizar a saída."
            );
        }
    };


/* =========================================================
   EXCLUIR
========================================================= */

window.excluirSaida =
    async function (id) {
        const saida =
            saidasCadastradas.find(
                item =>
                    item.id ===
                    Number(id)
            );

        if (!saida) {
            return;
        }

        const confirmar =
            confirm(
                `Deseja realmente excluir a saída "${saida.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {
            await remove(
                "saidas",
                Number(id)
            );

            await atualizarLista();

            alert(
                "Saída excluída com sucesso!"
            );

        } catch (error) {
            console.error(
                "Erro ao excluir saída:",
                error
            );

            alert(
                "Não foi possível excluir a saída."
            );
        }
    };


/* =========================================================
   FECHAR MODAL
========================================================= */

window.fecharModalSaida =
    function () {
        const modal =
            document.getElementById(
                "modal-edicao-saida"
            );

        const conteudo =
            document.getElementById(
                "conteudo-edicao-saida"
            );

        if (!modal) {
            return;
        }

        modal.classList.add(
            "d-none"
        );

        if (conteudo) {
            conteudo.innerHTML = "";
        }
    };


/* =========================================================
   DESTINO
========================================================= */

window.alternarDestinoSaida =
    function () {
        const tipoSaida =
            document.getElementById(
                "tipo_saida"
            ).value;

        document
            .getElementById(
                "campo_destino"
            )
            .classList.toggle(
                "d-none",
                tipoSaida === "doacao"
            );

        document
            .getElementById(
                "campo_beneficiado"
            )
            .classList.toggle(
                "d-none",
                tipoSaida !== "doacao"
            );
    };


function alternarDestinoEdicao() {
    const tipoSaida =
        document.getElementById(
            "edicao_saida_tipo"
        ).value;

    document
        .getElementById(
            "edicao_campo_destino"
        )
        .classList.toggle(
            "d-none",
            tipoSaida === "doacao"
        );

    document
        .getElementById(
            "edicao_campo_beneficiado"
        )
        .classList.toggle(
            "d-none",
            tipoSaida !== "doacao"
        );
}


/* =========================================================
   CARREGAR OPÇÕES
========================================================= */

async function carregarOpcoes() {
    const [
        destinos,
        beneficiados,
        entradas,
        insumos
    ] = await Promise.all([
        getAll("destinos"),
        getAll("beneficiados"),
        getAll("entradas"),
        getAll("insumos")
    ]);

    destinosCadastrados =
        destinos;

    beneficiadosCadastrados =
        beneficiados;

    preencherSelect(
        "destino",
        destinos,
        "Cadastre uma cozinha primeiro"
    );

    preencherSelect(
        "beneficiado",
        beneficiados,
        "Cadastre um beneficiado primeiro"
    );

    produtosCadastrados =
        montarProdutosCadastrados(
            insumos,
            entradas
        );

    const selectProdutos =
        document.getElementById(
            "nome"
        );

    selectProdutos.innerHTML =
        `
            <option value="">
                Selecione um insumo
            </option>
        ` +
        produtosCadastrados
            .map(
                item => `
                    <option
                        value="${escaparHtml(
                            item.nome
                        )}"
                    >
                        ${escaparHtml(
                            item.nome
                        )}
                    </option>
                `
            )
            .join("");
}


/* =========================================================
   PRODUTOS CADASTRADOS
========================================================= */

function montarProdutosCadastrados(
    insumos,
    entradas
) {
    const mapa =
        new Map();

    insumos.forEach(
        insumo => {
            const chave =
                normalizarTexto(
                    insumo.nome
                );

            if (!chave) {
                return;
            }

            mapa.set(
                chave,
                {
                    nome:
                        insumo.nome,

                    unidade:
                        normalizarUnidade(
                            insumo.unidade
                        )
                }
            );
        }
    );

    entradas.forEach(
        entrada => {
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

            mapa.set(
                chave,
                {
                    nome:
                        entrada.nome,

                    unidade:
                        normalizarUnidade(
                            entrada.unidade
                        )
                }
            );
        }
    );

    return Array.from(
        mapa.values()
    ).sort(
        (a, b) =>
            String(a.nome || "")
                .localeCompare(
                    String(b.nome || ""),
                    "pt-BR"
                )
    );
}


function preencherUnidadeProduto() {
    const nome =
        document.getElementById(
            "nome"
        ).value;

    const produto =
        produtosCadastrados.find(
            item =>
                normalizarTexto(
                    item.nome
                ) ===
                normalizarTexto(
                    nome
                )
        );

    if (
        produto?.unidade
    ) {
        document.getElementById(
            "unidade"
        ).value =
            produto.unidade;
    }
}


function preencherUnidadeProdutoEdicao() {
    const select =
        document.getElementById(
            "edicao_saida_produto"
        );

    if (!select) {
        return;
    }

    const produto =
        produtosCadastrados.find(
            item =>
                normalizarTexto(
                    item.nome
                ) ===
                normalizarTexto(
                    select.value
                )
        );

    if (
        produto?.unidade
    ) {
        const unidade =
            document.getElementById(
                "edicao_saida_unidade"
            );

        if (
            Array.from(
                unidade.options
            ).some(
                option =>
                    option.value ===
                    produto.unidade
            )
        ) {
            unidade.value =
                produto.unidade;
        }
    }
}


/* =========================================================
   SELECTS
========================================================= */

function preencherSelect(
    id,
    dados,
    vazio
) {
    const select =
        document.getElementById(
            id
        );

    select.innerHTML =
        dados.length
            ? dados.map(
                item =>
                    `<option value="${item.id}">
                        ${escaparHtml(
                            item.nome
                        )}
                    </option>`
            ).join("")
            : `
                <option value="">
                    ${vazio}
                </option>
            `;
}


function montarOpcoesSelect(
    dados,
    valorSelecionado,
    vazio
) {
    if (!dados.length) {
        return `
            <option value="">
                ${vazio}
            </option>
        `;
    }

    return dados.map(
        item => `
            <option
                value="${item.id}"
                ${
                    String(item.id) ===
                    String(valorSelecionado)
                        ? "selected"
                        : ""
                }
            >
                ${escaparHtml(
                    item.nome
                )}
            </option>
        `
    ).join("");
}


/* =========================================================
   LIMPAR
========================================================= */

function limparFormulario() {
    [
        "data",
        "nome",
        "qtd"
    ].forEach(id => {
        document.getElementById(
            id
        ).value = "";
    });

    document.getElementById(
        "unidade"
    ).value = "Quilo";
}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function normalizarUnidade(
    unidade
) {
    const mapa = {
        KG: "Quilo",
        QUILO: "Quilo",
        QUILOS: "Quilo",

        G: "Grama",
        GRAMA: "Grama",
        GRAMAS: "Grama",

        L: "Litros",
        LITRO: "Litros",
        LITROS: "Litros",

        ML: "Litros",

        UN: "Unidade",
        UNIDADE: "Unidade",
        UNIDADES: "Unidade",

        DUZIA: "Duzia",
        DUZIAS: "Duzia"
    };

    return (
        mapa[
            normalizarTexto(
                unidade
            )
        ] ||
        unidade ||
        "Quilo"
    );
}


function normalizarTexto(
    valor
) {
    return String(
        valor || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toUpperCase()
        .trim();
}


function escaparHtml(
    valor
) {
    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            valor ?? ""
        );

    return div.innerHTML;
}