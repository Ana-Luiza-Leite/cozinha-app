export function importarEntradas(json) {
    json.forEach(linha => {

        const registro = {
            data: linha["DATA"],
            origem: linha["ORIGEM"],
            nome: linha["PRODUTO"], // 👈 ESSENCIAL
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

    alert("Importação concluída com sucesso!");
}