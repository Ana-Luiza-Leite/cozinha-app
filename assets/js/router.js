const routes = {
    "/": "dashboard",
    "/estoque": "estoque",
    "/entradas": "entradas",
    "/saidas": "saidas",
    "/fichas-tecnicas": "fichasTecnicas",
    "/cadastros": "cadastros",
    "/relatorio": "relatorio",
    "/relatorios": "relatorio"
};

function getCurrentPath() {
    const hashPath = window.location.hash.replace(/^#/, "");
    return hashPath.replace(/\/$/, "") || "/";
}

export async function renderRoute() {
    const path = getCurrentPath();
    const page = routes[path] || "dashboard";

    try {
        const module = await import(`../pages/${page}.js`);
        document.getElementById("app").innerHTML = module.render();

        if (module.afterRender) await module.afterRender();
    } catch (error) {
        console.error("Erro ao carregar rota", error);
        document.getElementById("app").innerHTML = `
            <div class="alert alert-danger">
                Nao foi possivel carregar esta pagina.
            </div>
        `;
    }
}

export function navigate(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    window.location.hash = normalizedPath;
}

window.navigate = navigate;
