export function render() {
    return `
        <div class="container mt-5">
            <h1>📈 Relatórios</h1>
            <button class="btn btn-primary mb-3" onclick="navigate('/')">← Voltar</button>
            <div class="alert alert-info">Relatórios serão exibidos aqui</div>
            <canvas id="grafico"></canvas>
        </div>
    `;
}

export function afterRender() {
    console.log('Relatórios carregado');
}
