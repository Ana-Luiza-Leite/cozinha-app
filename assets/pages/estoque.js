import { calcularEstoque } from '../services/estoqueService.js';

export function render() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0">Estoque Atual</h2>
            <button class="btn btn-outline-secondary" onclick="navigate('/')">Voltar ao inicio</button>
        </div>
        <div id="lista"></div>
    `;
}

export async function afterRender() {
    const estoque = await calcularEstoque();

    document.getElementById("lista").innerHTML =
        Object.keys(estoque).map(nome => `
            <div class="card p-2 mb-2">
                ${nome}: ${estoque[nome]}
            </div>
        `).join("");
}
