import { initDB } from './db.js';
import { renderRoute } from './router.js';

window.onload = () => {
    initDB();
    renderRoute();
};