const routes = {
    "/": "dashboard",
    "/estoque": "estoque",
    "/entradas": "entradas",
    "/saidas": "saidas",
    "/cadastros": "cadastros",
    "/relatorio": "relatorio",
    "/relatorios": "relatorio"
};

export async function renderRoute() {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
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
    history.pushState({}, "", path);
    renderRoute();
}

window.navigate = navigate;
