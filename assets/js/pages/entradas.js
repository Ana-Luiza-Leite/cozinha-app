export function render() {
    return `
        <div class="container mt-5">
            <h1>📥 Entradas</h1>
            <button class="btn btn-primary mb-3" onclick="navigate('/')">← Voltar</button>
            <form class="mb-4">
                <div class="mb-3">
                    <label class="form-label">Produto</label>
                    <input type="text" class="form-control" placeholder="Nome do produto">
                </div>
                <div class="mb-3">
                    <label class="form-label">Quantidade</label>
                    <input type="number" class="form-control" placeholder="Quantidade">
                </div>
                <button type="submit" class="btn btn-success">Registrar Entrada</button>
            </form>
        </div>
    `;
}

export function afterRender() {
    console.log('Entradas carregado');
}
