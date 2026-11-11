export function exportarTabelaExcel(tabela, nomeArquivo) {
    if (!window.XLSX) throw new Error("SheetJS não está disponível.");
    const elemento = typeof tabela === "string" ? document.querySelector(tabela) : tabela;
    if (!elemento) throw new Error("Não há dados apresentados para exportar.");
    const workbook = XLSX.utils.table_to_book(elemento, { sheet: "Relatório" });
    XLSX.writeFile(workbook, `${nomeArquivo}.xlsx`);
}

export function imprimirRelatorio() { window.print(); }
