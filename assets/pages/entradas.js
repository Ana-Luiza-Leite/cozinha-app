import { add, getAll } from '../js/db.js';
import { importarExcel } from '../utils/excel.js';

window.importarArquivo = async function(file) {
    await importarExcel(file, "entrada");
    atualizarLista();
};

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Entradas</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao inicio</button>
        </div>

        <input type="file" accept=".xlsx,.xls,.csv" onchange="importarArquivo(this.files[0])" class="form-control mb-3">

        <div class="row g-2">
            <div class="col-md-3">
                <label class="form-label" for="data">Data</label>
                <input id="data" class="form-control" placeholder="dd/mm/aaaa">
            </div>

            <div class="col-md-3">
                <label class="form-label" for="origem">Origem</label>
                <input id="origem" class="form-control">
            </div>

            <div class="col-md-6">
                <label class="form-label" for="nome">Produto</label>
                <input id="nome" class="form-control">
            </div>

            <div class="col-md-2">
                <label class="form-label" for="qtd">Quantidade</label>
                <input id="qtd" type="number" step="0.01" class="form-control">
            </div>

            <div class="col-md-2">
                <label class="form-label" for="unidade">Unidade</label>
                <input id="unidade" class="form-control">
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

        <button class="btn btn-success mt-3" onclick="salvar()">Salvar entrada</button>

        <div id="lista" class="mt-4"></div>
    `;
}

export async function afterRender() {
    atualizarLista();
}

window.salvar = async function () {
    const registro = {
        data: document.getElementById("data").value,
        origem: document.getElementById("origem").value,
        nome: document.getElementById("nome").value,
        qtd: Number(document.getElementById("qtd").value),
        unidade: document.getElementById("unidade").value,
        valor_unitario: Number(document.getElementById("valor_unitario").value || 0),
        valor_total: Number(document.getElementById("valor_total").value || 0),
        validade: document.getElementById("validade").value,
        nota: document.getElementById("nota").value,
        tipo: "entrada"
    };

    if (!registro.nome) {
        alert("Informe o produto da entrada.");
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
                        ${dados.map(d => `
                            <tr>
                                <td>${d.data || ""}</td>
                                <td>${d.origem || ""}</td>
                                <td>${d.nome || ""}</td>
                                <td>${d.qtd || 0}</td>
                                <td>${d.unidade || ""}</td>
                                <td>${formatarNumero(d.valor_unitario)}</td>
                                <td>${formatarNumero(d.valor_total)}</td>
                                <td>${d.validade || ""}</td>
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
    ["data", "origem", "nome", "qtd", "unidade", "valor_unitario", "valor_total", "validade", "nota"]
        .forEach(id => document.getElementById(id).value = "");
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
