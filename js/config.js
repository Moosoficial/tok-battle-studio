export const dom = {};

export function initDOM() {
    dom.canvas = document.getElementById('studio-canvas');
    dom.ctx = dom.canvas ? dom.canvas.getContext('2d') : null;
    
    // Controles
    dom.tmplButtons = document.querySelectorAll('.template-btn');
    dom.inputTitle = document.getElementById('input-title');
    dom.inputSubtitle = document.getElementById('input-subtitle');
    dom.colorPrimary = document.getElementById('color-primary');
    dom.colorSecondary = document.getElementById('color-secondary');
    
    // Avatar
    dom.avatarInput = document.getElementById('avatar-input');
    dom.avatarDropZone = document.getElementById('avatar-drop-zone');
    dom.avatarPrompt = document.getElementById('avatar-prompt');
    dom.avatarPreviewContainer = document.getElementById('avatar-preview-container');
    dom.avatarPreviewImg = document.getElementById('avatar-preview-img');
    dom.btnRemoveAvatar = document.getElementById('btn-remove-avatar');
    
    // Video params
    dom.selectDuration = document.getElementById('select-duration');
    dom.selectFps = document.getElementById('select-fps');
    dom.inputFrameStart = document.getElementById('input-frame-start');
    dom.inputFrameEnd = document.getElementById('input-frame-end');
    
    // Playback
    dom.btnPlayPause = document.getElementById('btn-play-pause');
    dom.btnPlayPauseIcon = dom.btnPlayPause ? dom.btnPlayPause.querySelector('.btn-play-icon') : null;
    dom.timeDisplay = document.getElementById('time-display');
    dom.btnExport = document.getElementById('btn-export');
    dom.exportProgressContainer = document.getElementById('export-progress-container');
    dom.exportProgressFill = document.getElementById('export-progress-fill');
    dom.exportProgressText = document.getElementById('export-progress-text');

    // SPA Views
    dom.viewLanding = document.getElementById('view-landing');
    dom.viewAuth = document.getElementById('view-auth');
    dom.viewDashboard = document.getElementById('view-dashboard');
    dom.viewStudio = document.getElementById('view-studio');
    
    dom.btnLandingStart = document.getElementById('btn-landing-start');
    dom.btnBackDashboard = document.getElementById('btn-back-dashboard');
    dom.btnLogout = document.getElementById('btn-logout');
    dom.btnDashboardThemeToggle = document.getElementById('btn-dashboard-theme-toggle');
    dom.btnStudioThemeToggle = document.getElementById('btn-studio-theme-toggle');
    
    // Auth
    dom.authForm = document.getElementById('auth-form');
    dom.authUsername = document.getElementById('auth-username');
    dom.authPassword = document.getElementById('auth-password');
    dom.btnAuthSubmit = document.getElementById('btn-auth-submit');
    dom.linkToggleAuth = document.getElementById('link-toggle-auth');
    dom.authToggleText = document.getElementById('auth-toggle-text');
    dom.welcomeUserText = document.getElementById('welcome-user-text');
    
    // Dashboard
    dom.filterButtons = document.querySelectorAll('.filter-btn');
    dom.templateCards = document.querySelectorAll('.template-card');
    dom.customizeButtons = document.querySelectorAll('.btn-customize-template');
    
    // Guide
    dom.btnOpenGuide = document.getElementById('btn-open-guide');
    dom.btnCloseGuide = document.getElementById('btn-close-guide');
    dom.setupGuideModal = document.getElementById('setup-guide-modal');
    dom.tabButtons = document.querySelectorAll('.tab-btn');
    dom.tabPanes = document.querySelectorAll('.tab-pane');
    
    // Simulator
    dom.simulatedChatBox = document.getElementById('simulated-chat-box');
    dom.simulatedBattleBar = document.getElementById('simulated-battle-bar');
    dom.scoreTeamBlue = document.getElementById('score-team-blue');
    dom.scoreTeamRed = document.getElementById('score-team-red');
    dom.battleBlueTeam = document.getElementById('battle-blue-team');
    dom.battleRedTeam = document.getElementById('battle-red-team');
    dom.battleTimer = document.getElementById('battle-timer');
    dom.streamerTag = document.getElementById('streamer-tag');
}

export const mockComments = [
    { user: "carlos_tv", text: "¡Doble tap familia! 🔥", type: "text" },
    { user: "sofia.stream", text: "¡Vamos por el x5! 🥊", type: "text" },
    { user: "juan_live", text: "envió una Rosa 🌹", type: "gift" },
    { user: "la_patrona", text: "¡Guante activo guante activo!", type: "text" },
    { user: "gabriel_99", text: "envió una Gorra de TikTok 🧢", type: "gift" },
    { user: "el_tata", text: "¡Doble toque rápidoooo!", type: "text" },
    { user: "daniela_m", text: "¡Qué buena batalla! 🚀", type: "text" },
    { user: "streamer_fan", text: "envió un Corazón de TikTok 💖", type: "gift" },
    { user: "el_pepe", text: "Apoyen apoyen!! ⚡", type: "text" },
    { user: "marcos_12", text: "envió un TikTok 🎵", type: "gift" },
    { user: "andrea_ff", text: "¡Vamos que sí se gana!", type: "text" },
    { user: "king_battle", text: "envió un León 🦁", type: "gift" }
];
