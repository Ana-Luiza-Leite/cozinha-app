import { add } from '../db.js';

// 📥 IMPORTAR ENTRADAS
export function importarEntradas(json) {
    json.forEach(linha => {

        const registro = {
            data: linha["DATA"],
            origem: linha["ORIGEM"],
            nome: linha["PRODUTO"],
            qtd: Number(linha["QUANTIDADE"]),
            unidade: linha["UNIDADE"],
            valor_unitario: Number(linha["VALOR UNITÁRIO"] || 0),
            valor_total: Number(linha["VALOR TOTAL"] || 0),
            validade: linha["VALIDADE"],
            nota: linha["NOTA"],
            tipo: "entrada"
        };

        if (!registro.nome) return;

        add("entradas", registro);
    });

    alert("Entradas importadas com sucesso!");
}

// 📤 IMPORTAR SAÍDAS
export function importarSaidas(json) {
    json.forEach(linha => {

        const registro = {
            data: linha["DATA SAÍDA"],
            destino: linha["DESTINO"],
            nome: linha["PRODUTO"],
            qtd: Number(linha["QUANTIDADE"]),
            unidade: linha["UNIDADE"],
            tipo: "saida"
        };

        if (!registro.nome) return;

        add("saidas", registro);
    });

    alert("Saídas importadas com sucesso!");
}