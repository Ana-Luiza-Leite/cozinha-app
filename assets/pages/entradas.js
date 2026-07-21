import { add, getAll } from '../js/db.js';
import { importarExcel } from '../utils/excel.js';
import { aplicarMascaraData, formatarData } from '../utils/data.js';

window.importarArquivo = async function(file) {
    await importarExcel(file, "entrada");
    atualizarLista();
};

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Entradas</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao início</button>
        </div>


        <div class="row g-2">
            <div class="col-md-3">
                <label class="form-label" for="tipo_entrada">Tipo de entrada</label>
                <select id="tipo_entrada" class="form-select" onchange="alternarOrigemEntrada()">
                    <option value="compra">Compra / fornecedor</option>
                    <option value="doacao">Doacao / doador</option>
                </select>
            </div>

            <div class="col-md-3">
                <label class="form-label" for="data">Data</label>
                <input id="data" class="form-control" placeholder="dd/mm/aaaa">
            </div>

            <div class="col-md-3" id="campo_fornecedor">
                <label class="form-label" for="fornecedor">Fornecedor</label>
                <select id="fornecedor" class="form-select"></select>
            </div>

            <div class="col-md-3 d-none" id="campo_doador">
                <label class="form-label" for="doador">Doador</label>
                <select id="doador" class="form-select"></select>
            </div>

            <div class="col-md-6">
                <label class="form-label" for="insumo_select">Insumo / Produto</label>
                <select id="insumo_select" class="form-select">
                    <option value="">Selecione um insumo cadastrado</option>
                </select>
                <small class="form-text text-muted">
                    Você só pode selecionar insumos já cadastrados na tela de Cadastros
                </small>
            </div>

            <div class="col-md-2">
                <label class="form-label" for="qtd">Quantidade</label>
                <input id="qtd" type="number" step="0.01" class="form-control">
            </div>

            <div class="col-md-2">
                <label class="form-label" for="unidade">Unidade</label>
                <select id="unidade" class="form-select">
                    <option value="Quilo">Quilo</option>
                    <option value="Grama">Grama</option>
                    <option value="Duzia">Duzia</option>
                    <option value="Litros">Litros</option>
                </select>
            </div>

            <div class="col-md-2">
                <label class="form-label" for="valor_unitario">Valor unitario</label>
                <input id="valor_unitario" type="number" step="0.01" class="form-control">
            </div>

            <div class="col-md-2">
                <label class="form-label" for="valor_total">Valor total</label>
                <input id="valor_total" type="number" step="0.01" class="form-control">
            </div>

            <div class="col-md-2">
                <label class="form-label" for="validade">Validade</label>
                <input id="validade" class="form-control" placeholder="dd/mm/aaaa">
            </div>

            <div class="col-md-2">
                <label class="form-label" for="nota">Nota</label>
                <input id="nota" class="form-control">
            </div>
        </div>
        <br>
            <input type="file" accept=".xlsx,.xls,.csv" onchange="importarArquivo(this.files[0])" class="form-control mb-3">

        <button class="btn btn-success mt-3" onclick="salvar()">Salvar entrada</button>

        <div id="lista" class="mt-4"></div>
    `;
}

export async function afterRender() {
    aplicarMascaraData("data");
    aplicarMascaraData("validade");
    await carregarOpcoes();
    alternarOrigemEntrada();
    atualizarLista();
}

window.salvar = async function () {
    const insumoSelect = document.getElementById("insumo_select");
    const nomeInsumo = insumoSelect.options[insumoSelect.selectedIndex]?.text || "";
    const insumoId = insumoSelect.value;

    if (!insumoId) {
        alert("Selecione um insumo cadastrado.");
        return;
    }

    const tipoEntrada = document.getElementById("tipo_entrada").value;
    const fornecedorSelect = document.getElementById("fornecedor");
    const doadorSelect = document.getElementById("doador");
    const origem = tipoEntrada === "doacao"
        ? doadorSelect.options[doadorSelect.selectedIndex]?.text || ""
        : fornecedorSelect.options[fornecedorSelect.selectedIndex]?.text || "";

    const registro = {
        data: formatarData(document.getElementById("data").value),
        origem,
        tipo_entrada: tipoEntrada,
        fornecedor_id: tipoEntrada === "compra" ? fornecedorSelect.value : "",
        doador_id: tipoEntrada === "doacao" ? doadorSelect.value : "",
        insumo_id: Number(insumoId),
        nome: nomeInsumo,
        qtd: Number(document.getElementById("qtd").value),
        unidade: document.getElementById("unidade").value,
        valor_unitario: Number(document.getElementById("valor_unitario").value || 0),
        valor_total: Number(document.getElementById("valor_total").value || 0),
        validade: formatarData(document.getElementById("validade").value),
        nota: document.getElementById("nota").value,
        tipo: "entrada"
    };

    if (!registro.origem) {
        alert(tipoEntrada === "doacao" ? "Selecione um doador." : "Selecione um fornecedor.");
        return;
    }

    await add("entradas", registro);
    limparFormulario();
    atualizarLista();
};

async function atualizarLista() {
    const dados = await getAll("entradas");

    document.getElementById("lista").innerHTML = dados.length
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
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.map(d => `
                            <tr>
                                <td>${formatarData(d.data)}</td>
                                <td>${d.origem || ""}</td>
                                <td>${d.tipo_entrada === "doacao" ? "Doacao" : "Compra"}</td>
                                <td>${d.nome || ""}</td>
                                <td>${d.qtd || 0}</td>
                                <td>${d.unidade || ""}</td>
                                <td>${formatarNumero(d.valor_unitario)}</td>
                                <td>${formatarNumero(d.valor_total)}</td>
                                <td>${formatarData(d.validade)}</td>
                                <td>${d.nota || ""}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `
        : `<div class="alert alert-info">Nenhuma entrada registrada.</div>`;
}

function limparFormulario() {
    ["data", "qtd", "valor_unitario", "valor_total", "validade", "nota"]
        .forEach(id => document.getElementById(id).value = "");
    document.getElementById("unidade").value = "Quilo";
    document.getElementById("insumo_select").value = "";
}

window.alternarOrigemEntrada = function () {
    const tipoEntrada = document.getElementById("tipo_entrada").value;
    document.getElementById("campo_fornecedor").classList.toggle("d-none", tipoEntrada === "doacao");
    document.getElementById("campo_doador").classList.toggle("d-none", tipoEntrada !== "doacao");
};

async function carregarOpcoes() {
    const [fornecedores, doadores, insumos] = await Promise.all([
        getAll("fornecedores"),
        getAll("doadores"),
        getAll("insumos")
    ]);

    preencherSelect("fornecedor", fornecedores, "Cadastre um fornecedor primeiro");
    preencherSelect("doador", doadores, "Cadastre um doador primeiro");
    preencherSelectInsumo("insumo_select", insumos);
}

function preencherSelect(id, dados, vazio) {
    const select = document.getElementById(id);
    select.innerHTML = dados.length
        ? dados.map(item => `<option value="${item.id}">${item.nome}</option>`).join("")
        : `<option value="">${vazio}</option>`;
}

function preencherSelectInsumo(id, insumos) {
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">Selecione um insumo cadastrado</option>` +
        (insumos.length
            ? insumos.map(item => `<option value="${item.id}">${item.nome}</option>`).join("")
            : `<option value="" disabled>Nenhum insumo cadastrado</option>`
        );
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
