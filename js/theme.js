import { dom } from './config.js';
import { state, updateState } from './state.js';

export function initTheme() {
    // 1. Cargar el tema guardado en localStorage
    const savedTheme = localStorage.getItem('winsnipe_theme') || 'dark';
    setTheme(savedTheme);

    // 2. Agregar los oyentes de eventos a los botones de alternar
    if (dom.btnDashboardThemeToggle) {
        dom.btnDashboardThemeToggle.addEventListener('click', toggleTheme);
    }
    
    if (dom.btnStudioThemeToggle) {
        dom.btnStudioThemeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

export function setTheme(theme) {
    updateState({ currentTheme: theme });
    localStorage.setItem('winsnipe_theme', theme);

    // Aplicar o remover clase en el body y en html para Tailwind
    if (theme === 'light') {
        document.body.classList.add('theme-light');
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        updateToggleIcons('🌙'); // Mostrar luna cuando esté en modo claro
    } else {
        document.body.classList.remove('theme-light');
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        updateToggleIcons('☀️'); // Mostrar sol cuando esté en modo oscuro
    }
}

function updateToggleIcons(icon) {
    if (dom.btnDashboardThemeToggle) {
        dom.btnDashboardThemeToggle.textContent = icon;
    }
    if (dom.btnStudioThemeToggle) {
        dom.btnStudioThemeToggle.textContent = icon;
    }
}
