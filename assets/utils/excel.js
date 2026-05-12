import { importarEntradas, importarSaidas } from './importador.js';

export function importarExcel(file, tipoPreferido = null) {
    if (!file) return Promise.resolve();

    if (!window.XLSX) {
        alert("Biblioteca de planilhas nao carregada. Verifique sua conexao e tente novamente.");
        return Promise.reject(new Error("XLSX nao carregado"));
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let total = 0;

                for (const nomeAba of workbook.SheetNames) {
                    const sheet = workbook.Sheets[nomeAba];
                    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                    const aba = normalizarTexto(nomeAba);

                    if (tipoPreferido === "entrada" || aba.includes("ENTRADA")) {
                        total += await importarEntradas(json);
                        continue;
                    }

                    if (tipoPreferido === "saida" || aba.includes("SAIDA")) {
                        total += await importarSaidas(json);
                    }
                }

                alert(`Importacao concluida. ${total} registro(s) importado(s).`);
                resolve(total);
            } catch (error) {
                console.error("Erro ao importar planilha", error);
                alert("Nao foi possivel importar a planilha. Confira o formato do arquivo.");
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}
