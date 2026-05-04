import { importarEntradas } from './importador.js';

export function importarExcel(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        console.log("Dados da planilha:", json);

        importarEntradas(json);
    };

    reader.readAsArrayBuffer(file);
}