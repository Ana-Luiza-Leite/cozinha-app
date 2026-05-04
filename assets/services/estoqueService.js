import { getAll } from '../db.js';

export async function calcularEstoque() {
    const entradas = await getAll("entradas");
    const saidas = await getAll("saidas");

    let estoque = {};

    entradas.forEach(e => {
        estoque[e.nome] = (estoque[e.nome] || 0) + e.qtd;
    });

    saidas.forEach(s => {
        estoque[s.nome] = (estoque[s.nome] || 0) - s.qtd;
    });

    return estoque;
}