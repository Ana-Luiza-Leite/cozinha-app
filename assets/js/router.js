const routes = {
    "/": "dashboard",
    "/estoque": "estoque",
    "/entradas": "entradas",
    "/saidas": "saidas",
    "/fichas-tecnicas": "fichasTecnicas",
    "/cadastros": "cadastros",
    "/relatorio": "relatorio",
    "/relatorios": "relatorio",
    "/cardapio": "cardapio"
};

// Importações pré-carregadas para evitar problemas com caminhos dinâmicos
// assets/js/router.js (trecho)
const pageModules = {
    dashboard: () => import('../pages/dashboard.js'),
    estoque: () => import('../pages/estoque.js'),
    entradas: () => import('../pages/entradas.js'),
    saidas: () => import('../pages/saidas.js'),
    fichasTecnicas: () => import('../pages/fichasTecnicas.js'),
    cadastros: () => import('../pages/cadastros.js'),
    relatorio: () => import('../pages/relatorio.js'),
    cardapio: () => import('../pages/cardapio.js')
};

function getCurrentPath() {
    const hashPath = window.location.hash.replace(/^#/, "");
    return hashPath.replace(/\/$/, "") || "/";
}

export async function renderRoute() {
    const path = getCurrentPath();
    const pageName = routes[path] || "dashboard";

    try {
        // Usa importação pré-definida ao invés de dinâmica
        if (!pageModules[pageName]) {
            throw new Error(`Página ${pageName} não encontrada`);
        }

        const module = await pageModules[pageName]();
        
        const appContainer = document.getElementById("app");
        if (!appContainer) {
            console.error("Container #app não encontrado");
            return;
        }

        appContainer.innerHTML = module.render();

        if (module.afterRender && typeof module.afterRender === 'function') {
            await module.afterRender();
        }
    } catch (error) {
        console.error("Erro ao carregar rota:", error);
        document.getElementById("app").innerHTML = `
            <div class="alert alert-danger">
                Não foi possível carregar esta página: ${error.message}
            </div>
        `;
    }
}

export function navigate(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    window.location.hash = normalizedPath;
}

window.navigate = navigate;
