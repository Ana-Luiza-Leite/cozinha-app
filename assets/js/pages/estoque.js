export function render() {
    return `
        <div class="container mt-5">
            <h1>📦 Estoque</h1>
            <button class="btn btn-primary mb-3" onclick="navigate('/')">← Voltar</button>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Validade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Exemplo de Produto</td>
                        <td>10</td>
                        <td>2026-12-31</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

export function afterRender() {
    console.log('Estoque carregado');
}
