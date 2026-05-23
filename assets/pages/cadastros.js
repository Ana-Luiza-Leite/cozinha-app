import { add, getAll } from '../js/db.js';

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Cadastros</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao inicio</button>
        </div>

        <div class="row g-3">
            <div class="col-lg-6">
                <div class="card p-3 h-100">
                    <h5>Fornecedor</h5>
                    <input id="fornecedor_nome" class="form-control mb-2" placeholder="Razao social">
                    <input id="fornecedor_cnpj" class="form-control mb-2" placeholder="CNPJ">
                    <input id="fornecedor_email" class="form-control mb-2" placeholder="E-mail">
                    <input id="fornecedor_telefone" class="form-control mb-2" placeholder="Telefone">
                    <button class="btn btn-success" onclick="salvarFornecedor()">Salvar fornecedor</button>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card p-3 h-100">
                    <h5>Doador</h5>
                    <input id="doador_nome" class="form-control mb-2" placeholder="Nome">
                    <input id="doador_cpf" class="form-control mb-2" placeholder="CPF">
                    <input id="doador_telefone" class="form-control mb-2" placeholder="Telefone">
                    <button class="btn btn-success" onclick="salvarDoador()">Salvar doador</button>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card p-3 h-100">
                    <h5>Cozinha / Destino</h5>
                    <input id="destino_nome" class="form-control mb-2" placeholder="Nome da cozinha ou unidade destino">
                    <button class="btn btn-success" onclick="salvarDestino()">Salvar destino</button>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card p-3 h-100">
                    <h5>Beneficiado por doacao</h5>
                    <input id="beneficiado_nome" class="form-control mb-2" placeholder="Nome do beneficiado">
                    <input id="beneficiado_telefone" class="form-control mb-2" placeholder="Telefone">
                    <button class="btn btn-success" onclick="salvarBeneficiado()">Salvar beneficiado</button>
                </div>
            </div>
        </div>

        <div id="lista" class="mt-4"></div>
    `;
}

export async function afterRender() {
    atualizarLista();
}

window.salvarFornecedor = async function () {
    const registro = {
        nome: document.getElementById("fornecedor_nome").value.trim(),
        cnpj: document.getElementById("fornecedor_cnpj").value.trim(),
        email: document.getElementById("fornecedor_email").value.trim(),
        telefone: document.getElementById("fornecedor_telefone").value.trim()
    };

    if (!registro.nome) {
        alert("Informe a razao social do fornecedor.");
        return;
    }

    await add("fornecedores", registro);
    limpar(["fornecedor_nome", "fornecedor_cnpj", "fornecedor_email", "fornecedor_telefone"]);
    atualizarLista();
};

window.salvarDoador = async function () {
    const registro = {
        nome: document.getElementById("doador_nome").value.trim(),
        cpf: document.getElementById("doador_cpf").value.trim(),
        telefone: document.getElementById("doador_telefone").value.trim()
    };

    if (!registro.nome) {
        alert("Informe o nome do doador.");
        return;
    }

    await add("doadores", registro);
    limpar(["doador_nome", "doador_cpf", "doador_telefone"]);
    atualizarLista();
};

window.salvarDestino = async function () {
    const registro = {
        nome: document.getElementById("destino_nome").value.trim()
    };

    if (!registro.nome) {
        alert("Informe o nome do destino.");
        return;
    }

    await add("destinos", registro);
    limpar(["destino_nome"]);
    atualizarLista();
};

window.salvarBeneficiado = async function () {
    const registro = {
        nome: document.getElementById("beneficiado_nome").value.trim(),
        telefone: document.getElementById("beneficiado_telefone").value.trim()
    };

    if (!registro.nome) {
        alert("Informe o nome do beneficiado.");
        return;
    }

    await add("beneficiados", registro);
    limpar(["beneficiado_nome", "beneficiado_telefone"]);
    atualizarLista();
};

async function atualizarLista() {
    const [fornecedores, doadores, destinos, beneficiados] = await Promise.all([
        getAll("fornecedores"),
        getAll("doadores"),
        getAll("destinos"),
        getAll("beneficiados")
    ]);

    document.getElementById("lista").innerHTML = `
        <div class="row g-3">
            ${renderLista("Fornecedores", fornecedores, item => textoFornecedor(item))}
            ${renderLista("Doadores", doadores, item => `${item.nome}${item.cpf ? ` - CPF ${item.cpf}` : ""}`)}
            ${renderLista("Cozinhas / Destinos", destinos, item => item.nome)}
            ${renderLista("Beneficiados", beneficiados, item => `${item.nome}${item.telefone ? ` - ${item.telefone}` : ""}`)}
        </div>
    `;
}

function renderLista(titulo, dados, texto) {
    return `
        <div class="col-lg-6">
            <div class="card p-3 h-100">
                <h5>${titulo}</h5>
                ${dados.length
                    ? `<ul class="list-group list-group-flush">${dados.map(item => `<li class="list-group-item px-0">${texto(item)}</li>`).join("")}</ul>`
                    : `<div class="alert alert-info mb-0">Nenhum cadastro registrado.</div>`
                }
            </div>
        </div>
    `;
}

function textoFornecedor(item) {
    return [
        item.nome,
        item.cnpj ? `CNPJ ${item.cnpj}` : "",
        item.observacao || ""
    ].filter(Boolean).join(" - ");
}

function limpar(ids) {
    ids.forEach(id => document.getElementById(id).value = "");
}
