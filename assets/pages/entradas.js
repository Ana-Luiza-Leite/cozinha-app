import { add, getAll, put, remove } from '../js/db.js';
import { importarExcel } from '../utils/excel.js';
import { aplicarMascaraData, formatarData } from '../utils/data.js';

let entradasCadastradas = [];
let fornecedoresCadastrados = [];
let doadoresCadastrados = [];
let insumosCadastrados = [];


window.importarArquivo = async function (file) {
    await importarExcel(file, "entrada");
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
                width: min(900px, 95vw);
                max-height: 90vh;
                overflow-y: auto;
            }
        </style>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Entradas</h2>

            <button
                class="btn btn-outline-secondary"
                onclick="navigate('/')"
            >
                Voltar ao início
            </button>
        </div>

        <div class="row g-2">
            <div class="col-md-3">
                <label class="form-label" for="tipo_entrada">
                    Tipo de entrada
                </label>

                <select
                    id="tipo_entrada"
                    class="form-select"
                    onchange="alternarOrigemEntrada()"
                >
                    <option value="compra">
                        Compra / fornecedor
                    </option>

                    <option value="doacao">
                        Doacao / doador
                    </option>
                </select>
            </div>

            <div class="col-md-3">
                <label class="form-label" for="data">
                    Data
                </label>

                <input
                    id="data"
                    class="form-control"
                    placeholder="dd/mm/aaaa"
                >
            </div>

            <div class="col-md-3" id="campo_fornecedor">
                <label class="form-label" for="fornecedor">
                    Fornecedor
                </label>

                <select
                    id="fornecedor"
                    class="form-select"
                ></select>
            </div>

            <div
                class="col-md-3 d-none"
                id="campo_doador"
            >
                <label class="form-label" for="doador">
                    Doador
                </label>

                <select
                    id="doador"
                    class="form-select"
                ></select>
            </div>

            <div class="col-md-6">
                <label
                    class="form-label"
                    for="insumo_select"
                >
                    Insumo / Produto
                </label>

                <select
                    id="insumo_select"
                    class="form-select"
                >
                    <option value="">
                        Selecione um insumo cadastrado
                    </option>
                </select>

                <small class="form-text text-muted">
                    Você só pode selecionar insumos já cadastrados na tela de Cadastros
                </small>
            </div>

            <div class="col-md-2">
                <label class="form-label" for="qtd">
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
                <label class="form-label" for="unidade">
                    Unidade
                </label>

                <select
                    id="unidade"
                    class="form-select"
                >
                    <option value="Quilo">Quilo</option>
                    <option value="Grama">Grama</option>
                    <option value="Duzia">Duzia</option>
                    <option value="Litros">Litros</option>
                </select>
            </div>

            <div class="col-md-2">
                <label
                    class="form-label"
                    for="valor_unitario"
                >
                    Valor unitario
                </label>

                <input
                    id="valor_unitario"
                    type="number"
                    step="0.01"
                    class="form-control"
                >
            </div>

            <div class="col-md-2">
                <label
                    class="form-label"
                    for="valor_total"
                >
                    Valor total
                </label>

                <input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    class="form-control"
                    readonly
                >
            </div>

            <div class="col-md-2">
                <label
                    class="form-label"
                    for="validade"
                >
                    Validade
                </label>

                <input
                    id="validade"
                    class="form-control"
                    placeholder="dd/mm/aaaa"
                >
            </div>

            <div class="col-md-2">
                <label
                    class="form-label"
                    for="nota"
                >
                    Nota
                </label>

                <input
                    id="nota"
                    class="form-control"
                >
            </div>
        </div>

        <br>

        <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onchange="importarArquivo(this.files[0])"
            class="form-control mb-3"
        >

        <button
            class="btn btn-success mt-3"
            onclick="salvar()"
        >
            Salvar entrada
        </button>

        <div
            id="lista"
            class="mt-4"
        ></div>

        <!-- CARD DE EDIÇÃO -->
        <div
            id="modal-edicao-entrada"
            class="modal-edicao d-none"
        >
            <div
                class="modal-backdrop-custom"
                onclick="fecharModalEntrada()"
            ></div>

            <div class="card modal-card-custom shadow-lg">
                <div
                    class="card-header d-flex justify-content-between align-items-center"
                >
                    <h5 class="mb-0">
                        Editar entrada
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        onclick="fecharModalEntrada()"
                        aria-label="Fechar"
                    ></button>
                </div>

                <div
                    class="card-body"
                    id="conteudo-edicao-entrada"
                ></div>
            </div>
        </div>
    `;
}


export async function afterRender() {
    aplicarMascaraData("data");
    aplicarMascaraData("validade");

    await carregarOpcoes();

    alternarOrigemEntrada();

    document
        .getElementById("qtd")
        .addEventListener(
            "input",
            calcularValorTotal
        );

    document
        .getElementById("valor_unitario")
        .addEventListener(
            "input",
            calcularValorTotal
        );

    await atualizarLista();
}


/* =========================================================
   CALCULAR VALOR TOTAL
========================================================= */

function calcularValorTotal() {
    const qtd =
        Number(
            document.getElementById("qtd").value
        ) || 0;

    const valorUnitario =
        Number(
            document.getElementById(
                "valor_unitario"
            ).value
        ) || 0;

    document.getElementById(
        "valor_total"
    ).value =
        (
            qtd * valorUnitario
        ).toFixed(2);
}


/* =========================================================
   SALVAR NOVA ENTRADA
========================================================= */

window.salvar = async function () {
    const insumoSelect =
        document.getElementById(
            "insumo_select"
        );

    const nomeInsumo =
        insumoSelect.options[
            insumoSelect.selectedIndex
        ]?.text || "";

    const insumoId =
        insumoSelect.value;

    if (!insumoId) {
        alert(
            "Selecione um insumo cadastrado."
        );
        return;
    }

    const tipoEntrada =
        document.getElementById(
            "tipo_entrada"
        ).value;

    const fornecedorSelect =
        document.getElementById(
            "fornecedor"
        );

    const doadorSelect =
        document.getElementById(
            "doador"
        );

    const origem =
        tipoEntrada === "doacao"
            ? doadorSelect.options[
                doadorSelect.selectedIndex
            ]?.text || ""
            : fornecedorSelect.options[
                fornecedorSelect.selectedIndex
            ]?.text || "";

    const qtd =
        Number(
            document.getElementById(
                "qtd"
            ).value
        ) || 0;

    const valorUnitario =
        Number(
            document.getElementById(
                "valor_unitario"
            ).value
        ) || 0;

    const valorTotal =
        qtd * valorUnitario;

    const registro = {
        data: formatarData(
            document.getElementById(
                "data"
            ).value
        ),

        origem,

        tipo_entrada:
            tipoEntrada,

        fornecedor_id:
            tipoEntrada === "compra"
                ? fornecedorSelect.value
                : "",

        doador_id:
            tipoEntrada === "doacao"
                ? doadorSelect.value
                : "",

        insumo_id:
            Number(insumoId),

        nome:
            nomeInsumo,

        qtd,

        unidade:
            document.getElementById(
                "unidade"
            ).value,

        valor_unitario:
            valorUnitario,

        valor_total:
            valorTotal,

        validade:
            formatarData(
                document.getElementById(
                    "validade"
                ).value
            ),

        nota:
            document.getElementById(
                "nota"
            ).value,

        tipo: "entrada"
    };

    if (!registro.origem) {
        alert(
            tipoEntrada === "doacao"
                ? "Selecione um doador."
                : "Selecione um fornecedor."
        );

        return;
    }

    await add(
        "entradas",
        registro
    );

    limparFormulario();

    await atualizarLista();
};


/* =========================================================
   LISTA DE ENTRADAS
========================================================= */

async function atualizarLista() {
    const dados =
        await getAll("entradas");

    entradasCadastradas =
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
                                <th>Origem</th>
                                <th>Tipo</th>
                                <th>Insumo</th>
                                <th>Quantidade</th>
                                <th>Unidade</th>
                                <th>Valor unitario</th>
                                <th>Valor total</th>
                                <th>Validade</th>
                                <th>Nota</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${dados.map(d => `
                                <tr>
                                    <td>
                                        ${formatarData(d.data)}
                                    </td>

                                    <td>
                                        ${escaparHtml(
                                            d.origem || ""
                                        )}
                                    </td>

                                    <td>
                                        ${
                                            d.tipo_entrada === "doacao"
                                                ? "Doacao"
                                                : "Compra"
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
                                        ${formatarNumero(
                                            d.valor_unitario
                                        )}
                                    </td>

                                    <td>
                                        ${formatarNumero(
                                            d.valor_total
                                        )}
                                    </td>

                                    <td>
                                        ${formatarData(
                                            d.validade
                                        )}
                                    </td>

                                    <td>
                                        ${escaparHtml(
                                            d.nota || ""
                                        )}
                                    </td>

                                    <td>
                                        <div class="d-flex gap-1">

                                            <button
                                                class="btn btn-outline-primary btn-sm"
                                                onclick="editarEntrada(${d.id})"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="excluirEntrada(${d.id})"
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
                    Nenhuma entrada registrada.
                </div>
            `;
}


/* =========================================================
   EDITAR ENTRADA
========================================================= */

window.editarEntrada = function (id) {
    const entrada =
        entradasCadastradas.find(
            item =>
                item.id === Number(id)
        );

    if (!entrada) {
        alert(
            "Entrada não encontrada."
        );
        return;
    }

    const modal =
        document.getElementById(
            "modal-edicao-entrada"
        );

    const conteudo =
        document.getElementById(
            "conteudo-edicao-entrada"
        );

    conteudo.innerHTML =
        renderFormularioEdicao(
            entrada
        );

    modal.classList.remove(
        "d-none"
    );

    aplicarMascaraData(
        "edicao_entrada_data"
    );

    aplicarMascaraData(
        "edicao_entrada_validade"
    );

    document
        .getElementById(
            "edicao_entrada_qtd"
        )
        .addEventListener(
            "input",
            calcularValorTotalEdicao
        );

    document
        .getElementById(
            "edicao_entrada_valor_unitario"
        )
        .addEventListener(
            "input",
            calcularValorTotalEdicao
        );

    document
        .getElementById(
            "edicao_entrada_tipo"
        )
        .addEventListener(
            "change",
            alternarOrigemEdicao
        );

    document
        .getElementById(
            "edicao_entrada_insumo"
        )
        .addEventListener(
            "change",
            atualizarUnidadeEdicao
        );

    alternarOrigemEdicao();

    atualizarUnidadeEdicao();
};


function renderFormularioEdicao(
    entrada
) {
    return `
        <div class="row g-3">

            <div class="col-md-4">
                <label class="form-label">
                    Tipo de entrada
                </label>

                <select
                    id="edicao_entrada_tipo"
                    class="form-select"
                >
                    <option
                        value="compra"
                        ${
                            entrada.tipo_entrada === "compra"
                                ? "selected"
                                : ""
                        }
                    >
                        Compra / fornecedor
                    </option>

                    <option
                        value="doacao"
                        ${
                            entrada.tipo_entrada === "doacao"
                                ? "selected"
                                : ""
                        }
                    >
                        Doacao / doador
                    </option>
                </select>
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Data
                </label>

                <input
                    id="edicao_entrada_data"
                    class="form-control"
                    placeholder="dd/mm/aaaa"
                    value="${escaparHtml(
                        formatarData(
                            entrada.data
                        )
                    )}"
                >
            </div>

            <div
                class="col-md-4"
                id="edicao_campo_fornecedor"
            >
                <label class="form-label">
                    Fornecedor
                </label>

                <select
                    id="edicao_entrada_fornecedor"
                    class="form-select"
                >
                    ${montarOpcoesSelect(
                        fornecedoresCadastrados,
                        entrada.fornecedor_id,
                        "Cadastre um fornecedor primeiro"
                    )}
                </select>
            </div>

            <div
                class="col-md-4 d-none"
                id="edicao_campo_doador"
            >
                <label class="form-label">
                    Doador
                </label>

                <select
                    id="edicao_entrada_doador"
                    class="form-select"
                >
                    ${montarOpcoesSelect(
                        doadoresCadastrados,
                        entrada.doador_id,
                        "Cadastre um doador primeiro"
                    )}
                </select>
            </div>

            <div class="col-md-8">
                <label class="form-label">
                    Insumo / Produto
                </label>

                <select
                    id="edicao_entrada_insumo"
                    class="form-select"
                >
                    ${montarOpcoesSelect(
                        insumosCadastrados,
                        entrada.insumo_id,
                        "Nenhum insumo cadastrado"
                    )}
                </select>
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Quantidade
                </label>

                <input
                    id="edicao_entrada_qtd"
                    type="number"
                    step="0.01"
                    class="form-control"
                    value="${entrada.qtd ?? ""}"
                >
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Unidade
                </label>

                <select
                    id="edicao_entrada_unidade"
                    class="form-select"
                >
                    ${[
                        "Quilo",
                        "Grama",
                        "Duzia",
                        "Litros"
                    ].map(unidade => `
                        <option
                            value="${unidade}"
                            ${
                                entrada.unidade === unidade
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${unidade}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Valor unitario
                </label>

                <input
                    id="edicao_entrada_valor_unitario"
                    type="number"
                    step="0.01"
                    class="form-control"
                    value="${entrada.valor_unitario ?? ""}"
                >
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Valor total
                </label>

                <input
                    id="edicao_entrada_valor_total"
                    type="number"
                    step="0.01"
                    class="form-control"
                    readonly
                    value="${(
                        Number(entrada.qtd || 0) *
                        Number(entrada.valor_unitario || 0)
                    ).toFixed(2)}"
                >
            </div>

            <div class="col-md-4">
                <label class="form-label">
                    Validade
                </label>

                <input
                    id="edicao_entrada_validade"
                    class="form-control"
                    placeholder="dd/mm/aaaa"
                    value="${escaparHtml(
                        formatarData(
                            entrada.validade
                        )
                    )}"
                >
            </div>

            <div class="col-md-8">
                <label class="form-label">
                    Nota
                </label>

                <input
                    id="edicao_entrada_nota"
                    class="form-control"
                    value="${escaparHtml(
                        entrada.nota || ""
                    )}"
                >
            </div>

        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">

            <button
                type="button"
                class="btn btn-outline-secondary"
                onclick="fecharModalEntrada()"
            >
                Cancelar
            </button>

            <button
                type="button"
                class="btn btn-success"
                onclick="salvarEdicaoEntrada(${entrada.id})"
            >
                Salvar alterações
            </button>

        </div>
    `;
}


/* =========================================================
   SALVAR EDIÇÃO DA ENTRADA
========================================================= */

window.salvarEdicaoEntrada =
    async function (id) {
        const entradaOriginal =
            entradasCadastradas.find(
                item =>
                    item.id === Number(id)
            );

        if (!entradaOriginal) {
            alert(
                "Entrada não encontrada."
            );
            return;
        }

        const tipoEntrada =
            document.getElementById(
                "edicao_entrada_tipo"
            ).value;

        const fornecedorSelect =
            document.getElementById(
                "edicao_entrada_fornecedor"
            );

        const doadorSelect =
            document.getElementById(
                "edicao_entrada_doador"
            );

        const insumoSelect =
            document.getElementById(
                "edicao_entrada_insumo"
            );

        const insumoId =
            insumoSelect.value;

        if (!insumoId) {
            alert(
                "Selecione um insumo cadastrado."
            );
            return;
        }

        const nomeInsumo =
            insumoSelect.options[
                insumoSelect.selectedIndex
            ]?.text || "";

        const origem =
            tipoEntrada === "doacao"
                ? doadorSelect.options[
                    doadorSelect.selectedIndex
                ]?.text || ""
                : fornecedorSelect.options[
                    fornecedorSelect.selectedIndex
                ]?.text || "";

        if (!origem) {
            alert(
                tipoEntrada === "doacao"
                    ? "Selecione um doador."
                    : "Selecione um fornecedor."
            );
            return;
        }

        const qtd =
            Number(
                document.getElementById(
                    "edicao_entrada_qtd"
                ).value
            ) || 0;

        const valorUnitario =
            Number(
                document.getElementById(
                    "edicao_entrada_valor_unitario"
                ).value
            ) || 0;

        if (qtd <= 0) {
            alert(
                "Informe uma quantidade válida maior que zero."
            );
            return;
        }

        const registroAtualizado = {
            ...entradaOriginal,

            data: formatarData(
                document.getElementById(
                    "edicao_entrada_data"
                ).value
            ),

            origem,

            tipo_entrada:
                tipoEntrada,

            fornecedor_id:
                tipoEntrada === "compra"
                    ? fornecedorSelect.value
                    : "",

            doador_id:
                tipoEntrada === "doacao"
                    ? doadorSelect.value
                    : "",

            insumo_id:
                Number(insumoId),

            nome:
                nomeInsumo,

            qtd,

            unidade:
                document.getElementById(
                    "edicao_entrada_unidade"
                ).value,

            valor_unitario:
                valorUnitario,

            valor_total:
                qtd * valorUnitario,

            validade:
                formatarData(
                    document.getElementById(
                        "edicao_entrada_validade"
                    ).value
                ),

            nota:
                document.getElementById(
                    "edicao_entrada_nota"
                ).value
        };

        try {
            await put(
                "entradas",
                registroAtualizado
            );

            fecharModalEntrada();

            await atualizarLista();

            alert(
                "Entrada atualizada com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao atualizar entrada:",
                error
            );

            alert(
                "Não foi possível atualizar a entrada."
            );
        }
    };


function calcularValorTotalEdicao() {
    const qtd =
        Number(
            document.getElementById(
                "edicao_entrada_qtd"
            ).value
        ) || 0;

    const valorUnitario =
        Number(
            document.getElementById(
                "edicao_entrada_valor_unitario"
            ).value
        ) || 0;

    document.getElementById(
        "edicao_entrada_valor_total"
    ).value =
        (
            qtd * valorUnitario
        ).toFixed(2);
}


/* =========================================================
   EXCLUIR ENTRADA
========================================================= */

window.excluirEntrada =
    async function (id) {
        const entrada =
            entradasCadastradas.find(
                item =>
                    item.id === Number(id)
            );

        if (!entrada) {
            return;
        }

        const confirmar =
            confirm(
                `Deseja realmente excluir a entrada "${entrada.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {
            await remove(
                "entradas",
                Number(id)
            );

            await atualizarLista();

            alert(
                "Entrada excluída com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao excluir entrada:",
                error
            );

            alert(
                "Não foi possível excluir a entrada."
            );
        }
    };


/* =========================================================
   FECHAR MODAL
========================================================= */

window.fecharModalEntrada =
    function () {
        const modal =
            document.getElementById(
                "modal-edicao-entrada"
            );

        const conteudo =
            document.getElementById(
                "conteudo-edicao-entrada"
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
   ORIGEM
========================================================= */

window.alternarOrigemEntrada =
    function () {
        const tipoEntrada =
            document.getElementById(
                "tipo_entrada"
            ).value;

        document
            .getElementById(
                "campo_fornecedor"
            )
            .classList.toggle(
                "d-none",
                tipoEntrada === "doacao"
            );

        document
            .getElementById(
                "campo_doador"
            )
            .classList.toggle(
                "d-none",
                tipoEntrada !== "doacao"
            );
    };


function alternarOrigemEdicao() {
    const tipoEntrada =
        document.getElementById(
            "edicao_entrada_tipo"
        ).value;

    document
        .getElementById(
            "edicao_campo_fornecedor"
        )
        .classList.toggle(
            "d-none",
            tipoEntrada === "doacao"
        );

    document
        .getElementById(
            "edicao_campo_doador"
        )
        .classList.toggle(
            "d-none",
            tipoEntrada !== "doacao"
        );
}


/* =========================================================
   OPÇÕES
========================================================= */

async function carregarOpcoes() {
    const [
        fornecedores,
        doadores,
        insumos
    ] = await Promise.all([
        getAll("fornecedores"),
        getAll("doadores"),
        getAll("insumos")
    ]);

    fornecedoresCadastrados =
        fornecedores;

    doadoresCadastrados =
        doadores;

    insumosCadastrados =
        insumos;

    preencherSelect(
        "fornecedor",
        fornecedores,
        "Cadastre um fornecedor primeiro"
    );

    preencherSelect(
        "doador",
        doadores,
        "Cadastre um doador primeiro"
    );

    preencherSelectInsumo(
        "insumo_select",
        insumos
    );
}


function preencherSelect(
    id,
    dados,
    vazio
) {
    const select =
        document.getElementById(id);

    select.innerHTML =
        dados.length
            ? dados.map(item =>
                `<option value="${item.id}">
                    ${escaparHtml(item.nome)}
                </option>`
            ).join("")
            : `
                <option value="">
                    ${vazio}
                </option>
            `;
}


function preencherSelectInsumo(
    id,
    insumos
) {
    const select =
        document.getElementById(id);

    select.innerHTML =
        `
            <option value="">
                Selecione um insumo cadastrado
            </option>
        ` +
        (
            insumos.length
                ? insumos.map(item =>
                    `<option value="${item.id}">
                        ${escaparHtml(item.nome)}
                    </option>`
                ).join("")
                : `
                    <option
                        value=""
                        disabled
                    >
                        Nenhum insumo cadastrado
                    </option>
                `
        );
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

    return dados.map(item => `
        <option
            value="${item.id}"
            ${
                String(item.id) ===
                String(valorSelecionado)
                    ? "selected"
                    : ""
            }
        >
            ${escaparHtml(item.nome)}
        </option>
    `).join("");
}


function atualizarUnidadeEdicao() {
    const select =
        document.getElementById(
            "edicao_entrada_insumo"
        );

    if (!select) {
        return;
    }

    const insumo =
        insumosCadastrados.find(
            item =>
                String(item.id) ===
                String(select.value)
        );

    if (
        insumo &&
        insumo.unidade
    ) {
        const unidade =
            document.getElementById(
                "edicao_entrada_unidade"
            );

        if (
            Array.from(
                unidade.options
            ).some(
                option =>
                    option.value ===
                    insumo.unidade
            )
        ) {
            unidade.value =
                insumo.unidade;
        }
    }
}


/* =========================================================
   LIMPAR
========================================================= */

function limparFormulario() {
    [
        "data",
        "qtd",
        "valor_unitario",
        "valor_total",
        "validade",
        "nota"
    ].forEach(id => {
        document.getElementById(
            id
        ).value = "";
    });

    document.getElementById(
        "unidade"
    ).value = "Quilo";

    document.getElementById(
        "insumo_select"
    ).value = "";
}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarNumero(valor) {
    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
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