import { initDOM, dom } from './js/config.js';
import { updateState } from './js/state.js';
import { initAuth } from './js/auth.js';
import { initRouter, showView } from './js/router.js';
import { initCanvas } from './js/canvas.js';

document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    initAuth();
    initRouter();
    initCanvas();
    
    const savedUser = localStorage.getItem('tokbattle_user');
    if (savedUser) {
        updateState({ currentUser: savedUser });
        dom.welcomeUserText.textContent = `Hola, @${savedUser} 👋`;
        dom.streamerTag.textContent = `@${savedUser}`;
        showView('view-dashboard');
    } else {
        showView('view-landing');
    }
});
