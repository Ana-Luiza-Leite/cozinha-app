export function render() {
    return `
        <div class="row g-3">

            <div class="col-md-3">
                <div class="card p-3 text-center">
                    <h5>Estoque</h5>
                    <button class="btn btn-success" onclick="navigate('/estoque')">Ver</button>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card p-3 text-center">
                    <h5>Entradas</h5>
                    <button class="btn btn-success" onclick="navigate('/entradas')">Ver</button>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card p-3 text-center">
                    <h5>Saídas</h5>
                    <button class="btn btn-success" onclick="navigate('/saidas')">Ver</button>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card p-3 text-center">
                    <h5>Relatórios</h5>
                    <button class="btn btn-success" onclick="navigate('/relatorios')">Ver</button>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card p-3 text-center">
                    <h5>Fichas técnicas</h5>
                    <button class="btn btn-success" onclick="navigate('/fichas-tecnicas')">Ver</button>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card p-3 text-center">
                    <h5>Cadastros</h5>
                    <button class="btn btn-success" onclick="navigate('/cadastros')">Ver</button>
                </div>
            </div>

        </div>
    `;
}
