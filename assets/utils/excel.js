import { importarEntradas, importarSaidas } from './importador.js';

export function importarExcel(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        console.log("Abas encontradas:", workbook.SheetNames);

        workbook.SheetNames.forEach(nomeAba => {

            const sheet = workbook.Sheets[nomeAba];
            const json = XLSX.utils.sheet_to_json(sheet);

            console.log(`Importando aba: ${nomeAba}`, json);

            // 🔥 IDENTIFICA AUTOMATICAMENTE
            if (nomeAba.toUpperCase().includes("ENTRADA")) {
                importarEntradas(json);
            }

            if (nomeAba.toUpperCase().includes("SAÍDA") || nomeAba.toUpperCase().includes("SAIDA")) {
                importarSaidas(json);
            }
        });

        alert("Importação completa de todas as abas!");
    };

    reader.readAsArrayBuffer(file);
}