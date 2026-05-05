import { renderRoute } from './router.js';

// Renderizar rota ao carregar
renderRoute();

// Renderizar rota quando mudar o histórico
window.addEventListener('popstate', renderRoute);
