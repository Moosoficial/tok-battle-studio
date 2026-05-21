import { dom } from './config.js';
import { state, updateState } from './state.js';
import { showView } from './router.js';

export function initAuth() {
    // Alternar entre modo Login y Registro
    dom.linkToggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        updateState({ isRegisterMode: !state.isRegisterMode });
        
        const authTitle = dom.viewAuth.querySelector('.auth-header h2');
        const authSubtitle = dom.viewAuth.querySelector('.auth-header p');
        
        if (state.isRegisterMode) {
            authTitle.textContent = "Registro Streamer";
            authSubtitle.textContent = "Crea tu cuenta de TokBattle Studio";
            dom.btnAuthSubmit.innerHTML = "<span>📝</span> REGISTRARSE E INGRESAR";
            dom.authToggleText.childNodes[0].textContent = "¿Ya tienes cuenta? ";
            dom.linkToggleAuth.textContent = "Inicia sesión aquí";
        } else {
            authTitle.textContent = "Acceso Streamer";
            authSubtitle.textContent = "Personaliza y guarda tus configuraciones de batalla";
            dom.btnAuthSubmit.innerHTML = "<span>🔑</span> ENTRAR AL DASHBOARD";
            dom.authToggleText.childNodes[0].textContent = "¿No tienes cuenta? ";
            dom.linkToggleAuth.textContent = "Regístrate gratis";
        }
    });

    // Formulario de Submit
    dom.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = dom.authUsername.value.trim().toLowerCase();
        const password = dom.authPassword.value;
        
        if (!username || username.length < 3) {
            alert('El nombre de usuario de TikTok debe tener al menos 3 caracteres.');
            return;
        }
        if (!password || password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        
        let users = JSON.parse(localStorage.getItem('tokbattle_users') || '{}');
        
        if (state.isRegisterMode) {
            if (users[username]) {
                alert('Este nombre de usuario de TikTok ya se encuentra registrado.');
                return;
            }
            users[username] = password;
            localStorage.setItem('tokbattle_users', JSON.stringify(users));
        } else {
            if (!users[username] || users[username] !== password) {
                alert('Nombre de usuario de TikTok o contraseña incorrectos.');
                return;
            }
        }
        
        updateState({ currentUser: username });
        localStorage.setItem('tokbattle_user', username);
        
        dom.welcomeUserText.textContent = `Hola, @${state.currentUser} 👋`;
        dom.streamerTag.textContent = `@${state.currentUser}`;
        
        dom.authUsername.value = '';
        dom.authPassword.value = '';
        
        showView('view-dashboard');
    });

    // Botón Cerrar Sesión
    dom.btnLogout.addEventListener('click', () => {
        localStorage.removeItem('tokbattle_user');
        updateState({ currentUser: null });
        showView('view-landing');
    });
}
