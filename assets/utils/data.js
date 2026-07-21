export function aplicarMascaraData(id) {
    const campo = document.getElementById(id);
    if (!campo) return;

    campo.addEventListener("input", () => {
        campo.value = formatarDataDigitada(campo.value);
    });
}

export function formatarData(valor) {
    if (!valor) return "";

    if (valor instanceof Date) {
        return formatarDate(valor);
    }

    if (typeof valor === "number" && Number.isFinite(valor)) {
        return formatarDate(converterSerialExcel(valor));
    }

    const texto = String(valor).trim();
    if (!texto) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;
    if (/^\d{8}$/.test(texto)) return formatarDataDigitada(texto);

    const dataIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dataIso) {
        return `${dataIso[3]}/${dataIso[2]}/${dataIso[1]}`;
    }

    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) return texto;

    return formatarDate(data);
}

export function obterDataOrdenacao(valor) {
    if (!valor) return new Date(0);

    if (valor instanceof Date) return valor;

    if (typeof valor === "number" && Number.isFinite(valor)) {
        return converterSerialExcel(valor);
    }

    const texto = String(valor).trim();
    const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (partes) {
        return new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1]));
    }

    const dataCompacta = texto.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (dataCompacta) {
        return new Date(
            Number(dataCompacta[3]),
            Number(dataCompacta[2]) - 1,
            Number(dataCompacta[1])
        );
    }

    const data = new Date(texto);
    return Number.isNaN(data.getTime()) ? new Date(0) : data;
}

function formatarDataDigitada(valor) {
    const numeros = String(valor || "").replace(/\D/g, "").slice(0, 8);
    const partes = [
        numeros.slice(0, 2),
        numeros.slice(2, 4),
        numeros.slice(4, 8)
    ].filter(Boolean);

    return partes.join("/");
}

function formatarDate(data) {
    if (Number.isNaN(data.getTime())) return "";

    return data.toLocaleDateString("pt-BR");
}

function converterSerialExcel(serial) {
    const utc = Math.round((serial - 25569) * 86400 * 1000);
    const data = new Date(utc);
    return new Date(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
}
