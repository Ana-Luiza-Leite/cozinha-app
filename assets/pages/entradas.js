import { add, getAll } from '../js/db.js';
import { importarExcel } from '../utils/excel.js';

window.importarArquivo = async function(file) {
    await importarExcel(file, "entrada");
    atualizarLista();
};

export function render() {
    return `
        <h2>Entradas</h2>

        <input type="file" accept=".xlsx,.xls,.csv" onchange="importarArquivo(this.files[0])" class="form-control mb-3">

        <input id="nome" class="form-control mb-2" placeholder="Insumo">
        <input id="qtd" class="form-control mb-2" placeholder="Quantidade">

        <button class="btn btn-success" onclick="salvar()">Salvar</button>

        <div id="lista" class="mt-4"></div>
    `;
}

export async function afterRender() {
    atualizarLista();
}

window.salvar = async function () {
    await add("entradas", {
        nome: document.getElementById("nome").value,
        qtd: Number(document.getElementById("qtd").value),
        data: new Date()
    });

    atualizarLista();
};

async function atualizarLista() {
    const dados = await getAll("entradas");

    document.getElementById("lista").innerHTML =
        dados.map(d => `
            <div class="card p-2 mb-2">
                ${d.nome} - ${d.qtd}
            </div>
        `).join("");
}
