import { initDB } from './db.js';
import { renderRoute } from './router.js';

initDB().then(renderRoute).catch((error) => {
    console.error("Erro ao inicializar o banco", error);
    document.getElementById("app").innerHTML = `
        <div class="alert alert-danger">
            Nao foi possivel abrir o banco de dados do navegador.
        </div>
    `;
});

window.addEventListener('popstate', renderRoute);
