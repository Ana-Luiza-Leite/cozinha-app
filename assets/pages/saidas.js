import { add, getAll } from '../js/db.js';
import { importarExcel } from '../utils/excel.js';

window.importarSaidaArquivo = async function(file) {
    await importarExcel(file, "saida");
    atualizarLista();
};

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Saídas</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao início</button>
        </div>

        <div class="row g-2">
            <div class="col-md-3">
                <label class="form-label" for="data">Data saida</label>
                <input id="data" class="form-control" placeholder="dd/mm/aaaa">
            </div>

            <div class="col-md-3">
                <label class="form-label" for="tipo_saida">Tipo de destino</label>
                <select id="tipo_saida" class="form-select" onchange="alternarDestinoSaida()">
                    <option value="cozinha">Cozinha</option>
                    <option value="doacao">Doacao</option>
                </select>
            </div>

            <div class="col-md-3" id="campo_destino">
                <label class="form-label" for="destino">Para onde foi</label>
                <select id="destino" class="form-select"></select>
            </div>

            <div class="col-md-3 d-none" id="campo_beneficiado">
                <label class="form-label" for="beneficiado">Beneficiado</label>
                <select id="beneficiado" class="form-select"></select>
            </div>

            <div class="col-md-4">
                <label class="form-label" for="nome">Produto</label>
                <input id="nome" class="form-control" list="produtos" placeholder="Insumo">
                <datalist id="produtos"></datalist>
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
        </div>

        <input type="file" accept=".xlsx,.xls,.csv" onchange="importarSaidaArquivo(this.files[0])" class="form-control mt-3 mb-3">
        <button class="btn btn-danger" onclick="salvar()">Registrar saída</button>
        <div id="lista" class="mt-4"></div>
    `;
}

export async function afterRender() {
    await carregarOpcoes();
    alternarDestinoSaida();
    atualizarLista();
}

window.salvar = async function () {
    const tipoSaida = document.getElementById("tipo_saida").value;
    const destinoSelect = document.getElementById("destino");
    const beneficiadoSelect = document.getElementById("beneficiado");
    const destino = tipoSaida === "doacao"
        ? beneficiadoSelect.options[beneficiadoSelect.selectedIndex]?.text || ""
        : destinoSelect.options[destinoSelect.selectedIndex]?.text || "";

    if (!document.getElementById("nome").value) {
        alert("Informe o produto da saida.");
        return;
    }

    if (!destino) {
        alert(tipoSaida === "doacao" ? "Selecione o beneficiado da doação." : "Selecione a cozinha destino.");
        return;
    }

    await add("saidas", {
        nome: document.getElementById("nome").value,
        qtd: Number(document.getElementById("qtd").value),
        unidade: document.getElementById("unidade").value,
        data: document.getElementById("data").value,
        destino,
        tipo_saida: tipoSaida,
        destino_id: tipoSaida === "cozinha" ? destinoSelect.value : "",
        beneficiado_id: tipoSaida === "doacao" ? beneficiadoSelect.value : "",
        tipo: "saida"
    });

    limparFormulario();
    atualizarLista();
};

async function atualizarLista() {
    const dados = await getAll("saidas");

    document.getElementById("lista").innerHTML = dados.length
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
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.map(d => `
                            <tr>
                                <td>${formatarData(d.data)}</td>
                                <td>${d.destino || ""}</td>
                                <td>${d.tipo_saida === "doacao" ? "Doacao" : "Cozinha"}</td>
                                <td>${d.nome || ""}</td>
                                <td>${d.qtd || 0}</td>
                                <td>${d.unidade || ""}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `
        : `<div class="alert alert-info">Nenhuma saída registrada.</div>`;
}

window.alternarDestinoSaida = function () {
    const tipoSaida = document.getElementById("tipo_saida").value;
    document.getElementById("campo_destino").classList.toggle("d-none", tipoSaida === "doacao");
    document.getElementById("campo_beneficiado").classList.toggle("d-none", tipoSaida !== "doacao");
};

async function carregarOpcoes() {
    const [destinos, beneficiados, entradas] = await Promise.all([
        getAll("destinos"),
        getAll("beneficiados"),
        getAll("entradas")
    ]);

    preencherSelect("destino", destinos, "Cadastre uma cozinha primeiro");
    preencherSelect("beneficiado", beneficiados, "Cadastre um beneficiado primeiro");

    const produtos = [...new Set(entradas.map(item => item.nome).filter(Boolean))].sort();
    document.getElementById("produtos").innerHTML = produtos
        .map(nome => `<option value="${nome}"></option>`)
        .join("");
}

function preencherSelect(id, dados, vazio) {
    const select = document.getElementById(id);
    select.innerHTML = dados.length
        ? dados.map(item => `<option value="${item.id}">${item.nome}</option>`).join("")
        : `<option value="">${vazio}</option>`;
}

function limparFormulario() {
    ["data", "nome", "qtd"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("unidade").value = "Quilo";
}

function formatarData(valor) {
    if (!valor) return "";
    if (typeof valor === "string") return valor;

    return new Date(valor).toLocaleDateString("pt-BR");
}
