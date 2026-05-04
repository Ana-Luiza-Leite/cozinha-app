import { calcularEstoque } from '../services/estoqueService.js';

export function render() {
    return `
        <h2>Estoque Atual</h2>
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