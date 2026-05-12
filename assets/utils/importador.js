import { add } from '../js/db.js';

export async function importarEntradas(json) {
    let total = 0;

    for (const linha of json) {
        const registro = {
            data: valor(linha, ["DATA"]),
            origem: valor(linha, ["ORIGEM"]),
            nome: valor(linha, ["PRODUTO", "INSUMO", "NOME"]),
            qtd: numero(valor(linha, ["QUANTIDADE", "QTD"])),
            unidade: valor(linha, ["UNIDADE", "UND"]),
            valor_unitario: numero(valor(linha, ["VALOR UNITARIO", "VALOR UNITARIO", "VALOR UN"])),
            valor_total: numero(valor(linha, ["VALOR TOTAL", "TOTAL"])),
            validade: valor(linha, ["VALIDADE"]),
            nota: valor(linha, ["NOTA", "NF"]),
            tipo: "entrada"
        };

        if (!registro.nome) continue;

        await add("entradas", registro);
        total++;
    }

    return total;
}

export async function importarSaidas(json) {
    let total = 0;

    for (const linha of json) {
        const registro = {
            data: valor(linha, ["DATA SAIDA", "DATA"]),
            destino: valor(linha, ["DESTINO"]),
            nome: valor(linha, ["PRODUTO", "INSUMO", "NOME"]),
            qtd: numero(valor(linha, ["QUANTIDADE", "QTD"])),
            unidade: valor(linha, ["UNIDADE", "UND"]),
            tipo: "saida"
        };

        if (!registro.nome) continue;

        await add("saidas", registro);
        total++;
    }

    return total;
}

function valor(linha, nomes) {
    const mapa = Object.entries(linha).reduce((acc, [chave, conteudo]) => {
        acc[normalizarTexto(chave)] = conteudo;
        return acc;
    }, {});

    for (const nome of nomes) {
        const conteudo = mapa[normalizarTexto(nome)];
        if (conteudo !== undefined && conteudo !== "") return conteudo;
    }

    return "";
}

function numero(valorOriginal) {
    if (typeof valorOriginal === "number") return valorOriginal;

    const texto = String(valorOriginal || "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim();

    const resultado = Number(texto);
    return Number.isFinite(resultado) ? resultado : 0;
}

function normalizarTexto(valorOriginal) {
    return String(valorOriginal || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}
