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
                    <h5>Saidas</h5>
                    <button class="btn btn-success" onclick="navigate('/saidas')">Ver</button>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card p-3 text-center">
                    <h5>Relatorios</h5>
                    <button class="btn btn-success" onclick="navigate('/relatorios')">Ver</button>
                </div>
            </div>

        </div>
    `;
}
