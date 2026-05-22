import { add, getAll } from '../js/db.js';
import { importarExcel } from '../utils/excel.js';

window.importarSaidaArquivo = async function(file) {
    await importarExcel(file, "saida");
    atualizarLista();
};

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Saidas</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao inicio</button>
        </div>

        <input id="nome" class="form-control mb-2" placeholder="Insumo">
        <input id="qtd" class="form-control mb-2" placeholder="Quantidade">

        <input type="file" accept=".xlsx,.xls,.csv" onchange="importarSaidaArquivo(this.files[0])" class="form-control mt-3 mb-3">
        <button class="btn btn-danger" onclick="salvar()">Registrar</button>
        <div id="lista" class="mt-4"></div>
    `;
}

export async function afterRender() {
    atualizarLista();
}

window.salvar = async function () {
    await add("saidas", {
        nome: document.getElementById("nome").value,
        qtd: Number(document.getElementById("qtd").value),
        data: new Date(),
        tipo: "saida"
    });

    atualizarLista();
};

async function atualizarLista() {
    const dados = await getAll("saidas");

    document.getElementById("lista").innerHTML = dados.length
        ? dados.map(d => `
            <div class="card p-2 mb-2">
                ${d.nome} - ${d.qtd}
            </div>
        `).join("")
        : `<div class="alert alert-info">Nenhuma saida registrada.</div>`;
}
