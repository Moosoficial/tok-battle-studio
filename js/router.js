import { dom } from './config.js';
import { state, updateState } from './state.js';
import { startSimulation, stopSimulation } from './simulator.js';
import { startAnimation, stopAnimation } from './canvas.js';

export function showView(viewId) {
    dom.viewLanding.classList.add('hidden');
    dom.viewAuth.classList.add('hidden');
    dom.viewDashboard.classList.add('hidden');
    dom.viewStudio.classList.add('hidden');
    
    const activeView = document.getElementById(viewId);
    if (activeView) activeView.classList.remove('hidden');

    if (viewId === 'view-studio') {
        startSimulation();
        startAnimation();
    } else {
        stopSimulation();
        stopAnimation();
    }
}

export function initRouter() {
    dom.btnLandingStart.addEventListener('click', () => showView('view-auth'));
    dom.btnBackDashboard.addEventListener('click', () => showView('view-dashboard'));
    
    // Filtros Dashboard
    dom.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.category;
            dom.templateCards.forEach(card => {
                const tmplType = card.dataset.template;
                card.style.display = (category === 'all' || tmplType === category) ? 'flex' : 'none';
            });
        });
    });

    // Personalizar Plantillas
    dom.customizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tmpl = btn.dataset.template;
            showView('view-studio');
            const matchingTmplBtn = document.querySelector(`.template-btn[data-template="${tmpl}"]`);
            if (matchingTmplBtn) matchingTmplBtn.click();
        });
    });

    // Modal de Guía
    dom.btnOpenGuide.addEventListener('click', () => dom.setupGuideModal.classList.remove('hidden'));
    dom.btnCloseGuide.addEventListener('click', () => dom.setupGuideModal.classList.add('hidden'));

    dom.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetTab = btn.dataset.tab;
            dom.tabPanes.forEach(pane => pane.classList.add('hidden'));
            const activePane = document.getElementById(`pane-${targetTab}`);
            if (activePane) activePane.classList.remove('hidden');
        });
    });
}
