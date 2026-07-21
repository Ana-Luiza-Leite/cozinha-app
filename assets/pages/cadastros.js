import { add, getAll, put } from '../js/db.js';

const CADASTROS = {
    fornecedores: {
        titulo: "Fornecedor",
        plural: "Fornecedores",
        botao: "fornecedor",
        campos: [
            { nome: "nome", label: "Razao social" },
            { nome: "cnpj", label: "CNPJ" },
            { nome: "email", label: "E-mail", type: "email" },
            { nome: "telefone", label: "Telefone" }
        ]
    },
    doadores: {
        titulo: "Doador",
        plural: "Doadores",
        botao: "doador",
        campos: [
            { nome: "nome", label: "Nome" },
            { nome: "cpf", label: "CPF" },
            { nome: "telefone", label: "Celular" }
        ]
    },
    destinos: {
        titulo: "Cozinha / Destino",
        plural: "Cozinhas / Destinos",
        botao: "destino",
        campos: [
            { nome: "nome", label: "Nome da cozinha ou unidade destino" }
        ]
    },
    beneficiados: {
        titulo: "Beneficiado por doacao",
        plural: "Beneficiados",
        botao: "beneficiado",
        campos: [
            { nome: "nome", label: "Nome do beneficiado" },
            { nome: "telefone", label: "Telefone" }
        ]
    },
    insumos: {
        titulo: "Insumo / Ingrediente",
        plural: "Insumos / Ingredientes",
        botao: "insumo",
        campos: [
            { nome: "nome", label: "Nome do insumo" },
            { nome: "categoria", label: "Grupo", type: "select", opcoes: [
                "Secos",
                "Hortifruti",
                "Carnes",
                "Laticinios",
                "Temperos",
                "Outros"
            ] },
            { nome: "unidade", label: "Unidade padrao", type: "select", opcoes: [
                "kg",
                "g",
                "L",
                "ml",
                "un",
                "pct",
                "cx"
            ] }
        ]
    }
};

const idsEmEdicao = {};
let dadosPorTipo = {};

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Cadastros</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao inicio</button>
        </div>

        <div class="row g-3">
            ${Object.entries(CADASTROS).map(([storeName, config]) => renderFormulario(storeName, config)).join("")}
        </div>

        <div class="card p-3 mt-4">
            <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                <h4 class="mb-0">Consultar cadastros</h4>
                <input
                    id="consulta_cadastros"
                    class="form-control"
                    style="max-width: 360px"
                    placeholder="Buscar em todos os cadastros"
                >
            </div>
            <div id="lista"></div>
        </div>
    `;
}

export async function afterRender() {
    document.getElementById("consulta_cadastros").addEventListener("input", renderizarListas);
    atualizarLista();
}

window.salvarFornecedor = () => salvarCadastro("fornecedores");
window.salvarDoador = () => salvarCadastro("doadores");
window.salvarDestino = () => salvarCadastro("destinos");
window.salvarBeneficiado = () => salvarCadastro("beneficiados");
window.salvarInsumo = () => salvarCadastro("insumos");

window.editarCadastro = function (storeName, id) {
    const registro = (dadosPorTipo[storeName] || []).find(item => item.id === Number(id));
    if (!registro) return;

    idsEmEdicao[storeName] = registro.id;
    CADASTROS[storeName].campos.forEach((campo) => {
        document.getElementById(idCampo(storeName, campo.nome)).value = registro[campo.nome] || "";
    });

    document.getElementById(idBotao(storeName)).textContent = `Atualizar ${CADASTROS[storeName].botao}`;
    document.getElementById(idCancelar(storeName)).classList.remove("d-none");
    document.getElementById(idCampo(storeName, "nome")).focus();
};

window.cancelarEdicaoCadastro = function (storeName) {
    limparFormulario(storeName);
};

async function salvarCadastro(storeName) {
    const config = CADASTROS[storeName];
    const registro = lerFormulario(storeName, config);

    if (!registro.nome) {
        alert(`Informe o nome de ${config.botao}.`);
        return;
    }

    // Validação especial para insumos: verificar duplicação normalizada
    if (storeName === "insumos") {
        const nomesExistentes = (dadosPorTipo["insumos"] || [])
            .filter(item => item.id !== idsEmEdicao[storeName])
            .map(item => normalizarTexto(item.nome));
        
        const novoNomeNormalizado = normalizarTexto(registro.nome);
        
        if (nomesExistentes.includes(nomoNomeNormalizado)) {
            alert(`O insumo "${registro.nome}" já foi cadastrado. Nomes duplicados não são permitidos.`);
            return;
        }
    }

    if (idsEmEdicao[storeName]) {
        registro.id = idsEmEdicao[storeName];
        await put(storeName, registro);
    } else {
        await add(storeName, registro);
    }

    limparFormulario(storeName);
    atualizarLista();
}

async function atualizarLista() {
    const entradas = await Promise.all(
        Object.keys(CADASTROS).map(async storeName => [storeName, await getAll(storeName)])
    );

    dadosPorTipo = Object.fromEntries(entradas);
    renderizarListas();
}

function renderizarListas() {
    const termo = normalizarTexto(document.getElementById("consulta_cadastros")?.value || "");

    document.getElementById("lista").innerHTML = `
        <div class="row g-3">
            ${Object.entries(CADASTROS).map(([storeName, config]) => {
                const dados = filtrarDados(dadosPorTipo[storeName] || [], termo);
                return renderLista(storeName, config, dados);
            }).join("")}
        </div>
    `;
}

function renderFormulario(storeName, config) {
    return `
        <div class="col-lg-6">
            <div class="card p-3 h-100">
                <h5>${config.titulo}</h5>
                ${config.campos.map(campo => renderCampo(storeName, campo)).join("")}
                <div class="d-flex gap-2">
                    <button
                        id="${idBotao(storeName)}"
                        class="btn btn-success flex-fill"
                        onclick="${nomeFuncaoSalvar(storeName)}()"
                    >
                        Salvar ${config.botao}
                    </button>
                    <button
                        id="${idCancelar(storeName)}"
                        class="btn btn-outline-secondary d-none"
                        onclick="cancelarEdicaoCadastro('${storeName}')"
                        type="button"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderCampo(storeName, campo) {
    if (campo.type === "select") {
        return `
            <select id="${idCampo(storeName, campo.nome)}" class="form-select mb-2">
                <option value="">${campo.label}</option>
                ${campo.opcoes.map(opcao => `<option value="${opcao}">${opcao}</option>`).join("")}
            </select>
        `;
    }

    return `
        <input
            id="${idCampo(storeName, campo.nome)}"
            class="form-control mb-2"
            placeholder="${campo.label}"
            type="${campo.type || "text"}"
        >
    `;
}

function renderLista(storeName, config, dados) {
    return `
        <div class="col-lg-6">
            <div class="border rounded p-3 h-100">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="mb-0">${config.plural}</h5>
                    <span class="badge text-bg-success">${dados.length}</span>
                </div>
                ${dados.length
                    ? `<div class="list-group list-group-flush">
                        ${dados.map(item => renderItemLista(storeName, config, item)).join("")}
                    </div>`
                    : `<div class="alert alert-info mb-0">Nenhum cadastro encontrado.</div>`
                }
            </div>
        </div>
    `;
}

function renderItemLista(storeName, config, item) {
    const detalhes = config.campos
        .filter(campo => campo.nome !== "nome" && item[campo.nome])
        .map(campo => `${campo.label}: ${item[campo.nome]}`)
        .join(" | ");

    return `
        <div class="list-group-item px-0">
            <div class="d-flex justify-content-between gap-2">
                <div>
                    <div class="fw-semibold">${escaparHtml(item.nome)}</div>
                    ${detalhes ? `<div class="small text-muted">${escaparHtml(detalhes)}</div>` : ""}
                </div>
                <button
                    class="btn btn-outline-success btn-sm"
                    onclick="editarCadastro('${storeName}', ${item.id})"
                    type="button"
                >
                    Editar
                </button>
            </div>
        </div>
    `;
}

function lerFormulario(storeName, config) {
    return config.campos.reduce((registro, campo) => {
        registro[campo.nome] = document.getElementById(idCampo(storeName, campo.nome)).value.trim();
        return registro;
    }, {});
}

function limparFormulario(storeName) {
    delete idsEmEdicao[storeName];
    CADASTROS[storeName].campos.forEach((campo) => {
        document.getElementById(idCampo(storeName, campo.nome)).value = "";
    });
    document.getElementById(idBotao(storeName)).textContent = `Salvar ${CADASTROS[storeName].botao}`;
    document.getElementById(idCancelar(storeName)).classList.add("d-none");
}

function filtrarDados(dados, termo) {
    if (!termo) return dados;

    return dados.filter(item => normalizarTexto(Object.values(item).join(" ")).includes(termo));
}

function nomeFuncaoSalvar(storeName) {
    return {
        fornecedores: "salvarFornecedor",
        doadores: "salvarDoador",
        destinos: "salvarDestino",
        beneficiados: "salvarBeneficiado",
        insumos: "salvarInsumo"
    }[storeName];
}

function idCampo(storeName, campo) {
    return `${storeName}_${campo}`;
}

function idBotao(storeName) {
    return `${storeName}_botao_salvar`;
}

function idCancelar(storeName) {
    return `${storeName}_botao_cancelar`;
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

function escaparHtml(valor) {
    const div = document.createElement("div");
    div.textContent = String(valor ?? "");
    return div.innerHTML;
}
