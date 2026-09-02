export function render() {
    return `
        <div class="row g-3">
            ${renderCard("Estoque", "/estoque")}
            ${renderCard("Entradas", "/entradas")}
            ${renderCard("Saidas", "/saidas")}
            ${renderCard("Fichas tecnicas", "/fichas-tecnicas")}
            ${renderCard("Cardapio", "/cardapio")}
            ${renderCard("Cadastros", "/cadastros")}
            ${renderCard("Relatorios", "/relatorios")}
        </div>
    `;
}

function renderCard(titulo, rota) {
    return `
        <div class="col-md-3">
            <div class="card p-3 text-center">
                <h5>${titulo}</h5>
                <button class="btn btn-success" onclick="navigate('${rota}')">Ver</button>
            </div>
        </div>
    `;
}
