export function render() {
    return `
        <div class="container mt-5">
            <h1>📊 Dashboard</h1>
            <div class="row mt-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title">Estoque Total</h5>
                            <p class="card-text">0 itens</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title">Entradas</h5>
                            <p class="card-text">0 hoje</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h5 class="card-title">Saídas</h5>
                            <p class="card-text">0 hoje</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <h5 class="card-title">Vencimentos</h5>
                            <p class="card-text">0 alertas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function afterRender() {
    console.log('Dashboard carregado');
}
