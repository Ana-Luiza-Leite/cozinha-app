import { add, getAll } from '../js/db.js';

import { importarExcel } from '../utils/excel.js';

window.importarSaidaArquivo = function(file) {
    importarExcel(file, "saida");
};
export function render() {
    return `
        <h2>Saídas</h2>

        <input id="nome" class="form-control mb-2" placeholder="Insumo">
        <input id="qtd" class="form-control mb-2" placeholder="Quantidade">

        <button class="btn btn-danger" onclick="salvar()">Registrar</button>
        <input type="file" onchange="importarSaidaArquivo(this.files[0])" class="form-control mb-3">
        <div id="lista" class="mt-4"></div>
    `;
}

export async function afterRender() {
    atualizarLista();
}

window.salvar = function () {
    add("saidas", {
        nome: document.getElementById("nome").value,
        qtd: Number(document.getElementById("qtd").value),
        data: new Date()
    });

    atualizarLista();
};

async function atualizarLista() {
    const dados = await getAll("saidas");

    document.getElementById("lista").innerHTML =
        dados.map(d => `
            <div class="card p-2 mb-2">
                ${d.nome} - ${d.qtd}
            </div>
        `).join("");
}