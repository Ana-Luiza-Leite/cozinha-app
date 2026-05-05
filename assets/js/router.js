const routes = {
    "/": "dashboard",
    "/estoque": "estoque",
    "/entradas": "entradas",
    "/saidas": "saidas",
    "/relatorios": "relatorios"
};

export async function renderRoute() {
    const path = window.location.pathname;
    const page = routes[path] || "dashboard";

    const module = await import(`./pages/${page}.js`);
    document.getElementById("app").innerHTML = module.render();

    if (module.afterRender) module.afterRender();
}

export function navigate(path) {
    history.pushState({}, "", path);
    renderRoute();
}

window.navigate = navigate;
