import { dom } from './config.js';
import { state, updateState } from './state.js';
import { showView } from './router.js';
import { 
    startAnimation, 
    setAvatarImage, 
    setGloveImage, 
    setCurrentTemplate, 
    setTimelineBounds 
} from './canvas.js';
import { 
    initThreeAR, 
    startThreeAR, 
    stopThreeAR, 
    updateColorsFromDOM, 
    rebuildGloveMesh 
} from './three-ar.js';

export function initDashboard() {
    // 1. Cargar y renderizar las alertas guardadas al inicio
    renderSavedPresets();

    // 2. Event Listener para GUARDAR ALERTA en el Editor Studio
    if (dom.btnSaveTemplate) {
        dom.btnSaveTemplate.addEventListener('click', saveCurrentPreset);
    }

    // 3. Event Listeners para Conmutador 2D / 3D
    if (dom.btnMode2D && dom.btnMode3D) {
        dom.btnMode2D.addEventListener('click', () => switchPreviewMode('2d'));
        dom.btnMode3D.addEventListener('click', () => switchPreviewMode('3d'));
    }
}

// Cambia el modo de simulación (Overlay 2D del Canvas vs AR 3D de Three.js)
export function switchPreviewMode(mode) {
    if (mode === '3d') {
        dom.btnMode2D.classList.remove('active');
        dom.btnMode2D.style.background = 'transparent';
        dom.btnMode2D.style.color = 'var(--text-secondary)';

        dom.btnMode3D.classList.add('active');
        dom.btnMode3D.style.background = 'var(--color-primary)';
        dom.btnMode3D.style.color = '#ffffff';

        // Ocultar Overlay HTML y mostrar contenedor Three.js
        dom.canvas3DContainer.classList.remove('hidden');
        
        // Inicializar y arrancar Three.js
        initThreeAR();
        updateColorsFromDOM();
        rebuildGloveMesh();
        startThreeAR();
    } else {
        dom.btnMode3D.classList.remove('active');
        dom.btnMode3D.style.background = 'transparent';
        dom.btnMode3D.style.color = 'var(--text-secondary)';

        dom.btnMode2D.classList.add('active');
        dom.btnMode2D.style.background = 'var(--color-primary)';
        dom.btnMode2D.style.color = '#ffffff';

        // Ocultar contenedor Three.js y detener animación
        dom.canvas3DContainer.classList.add('hidden');
        stopThreeAR();
    }
}

// Guarda la configuración actual del Studio en localStorage
function saveCurrentPreset() {
    const name = prompt('Ingresa un nombre para tu diseño personalizado:', `Mi Alerta ${dom.inputTitle.value || 'Neón'}`);
    if (name === null) return; // Cancelado
    if (!name.trim()) {
        alert('¡Error! El nombre no puede estar vacío.');
        return;
    }

    // Obtener los valores del formulario
    const activeTemplateBtn = document.querySelector('.template-btn.active');
    const templateType = activeTemplateBtn ? activeTemplateBtn.dataset.template : 'tap';
    
    const primaryColor = dom.colorPrimary.value;
    const secondaryColor = dom.colorSecondary.value;
    const titleText = dom.inputTitle.value;
    const subtitleText = dom.inputSubtitle.value;
    const duration = parseInt(dom.selectDuration.value) || 10;
    const fps = parseInt(dom.selectFps.value) || 60;
    const frameStart = parseInt(dom.inputFrameStart.value) || 0;
    const frameEnd = parseInt(dom.inputFrameEnd.value) || (duration * fps);

    // Obtener DataURLs de imágenes cargadas (base64)
    const avatarDataUrl = (!dom.avatarPreviewContainer.classList.contains('hidden')) ? dom.avatarPreviewImg.src : null;
    const gloveDataUrl = (!dom.glovePreviewContainer.classList.contains('hidden')) ? dom.glovePreviewImg.src : null;

    // Crear objeto del Preset basado en el Schema de WinSnipe
    const newPreset = {
        id_efecto: 'winsnipe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        id_usuario: state.currentUser || 'anonymous_streamer',
        nombre: name.trim(),
        tipo_efecto: templateType,
        configuracion_visual: {
            color_primario: primaryColor,
            color_secundario: secondaryColor,
            titulo: titleText,
            subtitulo: subtitleText,
            avatar_url: avatarDataUrl, // base64
            glove_url: gloveDataUrl // base64
        },
        linea_tiempo_ar: {
            frame_start: frameStart,
            frame_end: frameEnd,
            duration: duration,
            fps: fps
        }
    };

    // Almacenar en localStorage
    let presets = JSON.parse(localStorage.getItem('winsnipe_presets')) || [];
    presets.push(newPreset);
    localStorage.setItem('winsnipe_presets', JSON.stringify(presets));

    alert('¡Excelente capitán! Tu diseño neón se ha guardado en tu catálogo personal.');
    
    // Recargar grid de dashboard
    renderSavedPresets();
}

// Renderiza los presets guardados del usuario en el Dashboard
export function renderSavedPresets() {
    if (!dom.savedTemplatesGrid || !dom.savedDesignsTitle) return;

    const presets = JSON.parse(localStorage.getItem('winsnipe_presets')) || [];
    
    if (presets.length === 0) {
        dom.savedTemplatesGrid.style.display = 'none';
        dom.savedDesignsTitle.style.display = 'none';
        return;
    }

    // Mostrar sección
    dom.savedTemplatesGrid.style.display = 'grid';
    dom.savedDesignsTitle.style.display = 'block';
    
    dom.savedTemplatesGrid.innerHTML = '';

    presets.forEach(preset => {
        const card = document.createElement('div');
        card.className = 'template-card saved-preset-card';
        card.style.border = `1px solid ${preset.configuracion_visual.color_primario || 'var(--color-primary)'}`;
        card.style.boxShadow = `0 4px 20px ${hexToRgbA(preset.configuracion_visual.color_primario || '#ff0050', 0.12)}`;

        // Icono según tipo
        let typeIcon = '⚡';
        let typeLabel = 'Tap Tap';
        let previewBgClass = 'tap-preview-bg';
        if (preset.tipo_efecto === 'glove') {
            typeIcon = '🥊';
            typeLabel = 'Guante x5';
            previewBgClass = 'glove-preview-bg';
        } else if (preset.tipo_efecto === 'versus') {
            typeIcon = '⚔️';
            typeLabel = 'Batalla VS';
            previewBgClass = 'versus-preview-bg';
        }

        // Si hay avatar personalizado, ponerlo en el badge o preview
        const hasAvatar = !!preset.configuracion_visual.avatar_url;
        const avatarHTML = hasAvatar ? `<img src="${preset.configuracion_visual.avatar_url}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid ${preset.configuracion_visual.color_secundario || '#00f2fe'}; object-fit: cover; position: absolute; bottom: 10px; right: 10px; box-shadow: 0 0 10px ${preset.configuracion_visual.color_secundario};" alt="Avatar">` : '';

        card.innerHTML = `
            <div class="template-card-preview ${previewBgClass}">
                <span class="template-badge" style="background: ${preset.configuracion_visual.color_primario}">Diseñado</span>
                <div class="preview-animation-icon" style="color: ${preset.configuracion_visual.color_primario}">${typeIcon}</div>
                ${avatarHTML}
            </div>
            <div class="template-card-info">
                <h3 style="display: flex; align-items: center; justify-content: space-between;">
                    <span>${preset.nombre}</span>
                    <span style="font-size: 0.7rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--glass-border);">${typeLabel}</span>
                </h3>
                <p>Configuración: ${preset.configuracion_visual.titulo || 'Sin título'} (${preset.linea_tiempo_ar.duration}s @ ${preset.linea_tiempo_ar.fps}fps)</p>
                <div class="preset-card-actions" style="display: flex; gap: 8px; margin-top: 10px;">
                    <button class="btn-edit-preset" data-id="${preset.id_efecto}" style="flex: 2; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border: none; color: #000; padding: 10px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer; font-size: 0.8rem; transition: var(--transition-smooth);">Editar 🎨</button>
                    <button class="btn-duplicate-preset" data-id="${preset.id_efecto}" style="flex: 1; background: var(--bg-dark-700); border: 1px solid var(--glass-border); color: #fff; padding: 10px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-size: 0.8rem; transition: var(--transition-smooth);" title="Duplicar">👥</button>
                    <button class="btn-delete-preset" data-id="${preset.id_efecto}" style="flex: 1; background: rgba(255,51,51,0.12); border: 1px solid rgba(255,51,51,0.3); color: var(--color-red); padding: 10px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-size: 0.8rem; transition: var(--transition-smooth);" title="Borrar">✕</button>
                </div>
            </div>
        `;

        dom.savedTemplatesGrid.appendChild(card);
    });

    // Enlazar los eventos de los botones recién creados
    document.querySelectorAll('.btn-edit-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const preset = presets.find(p => p.id_efecto === id);
            if (preset) loadPresetIntoStudio(preset);
        });
    });

    document.querySelectorAll('.btn-duplicate-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            duplicatePreset(id);
        });
    });

    document.querySelectorAll('.btn-delete-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('¿Estás seguro de que deseas eliminar permanentemente esta alerta personalizada?')) {
                deletePreset(id);
            }
        });
    });
}

// Carga los parámetros guardados de un preset de vuelta en el Editor Studio
function loadPresetIntoStudio(preset) {
    // 1. Cargar textos e inputs básicos
    dom.inputTitle.value = preset.configuracion_visual.titulo;
    dom.inputSubtitle.value = preset.configuracion_visual.subtitulo;
    dom.colorPrimary.value = preset.configuracion_visual.color_primario;
    dom.colorSecondary.value = preset.configuracion_visual.color_secundario;

    // Actualizar visualizaciones de colores (las pastillas traseras)
    dom.colorPrimary.nextElementSibling.style.backgroundColor = preset.configuracion_visual.color_primario;
    dom.colorSecondary.nextElementSibling.style.backgroundColor = preset.configuracion_visual.color_secundario;

    // 2. Cargar duraciones y sliders
    dom.selectDuration.value = preset.linea_tiempo_ar.duration.toString();
    dom.selectFps.value = preset.linea_tiempo_ar.fps.toString();
    
    // Configurar máximos y valores en timeline
    const totalFrames = preset.linea_tiempo_ar.duration * preset.linea_tiempo_ar.fps;
    dom.inputFrameStart.max = totalFrames;
    dom.inputFrameEnd.max = totalFrames;
    dom.inputFrameStart.value = preset.linea_tiempo_ar.frame_start;
    dom.inputFrameEnd.value = preset.linea_tiempo_ar.frame_end;

    // Sincronizar en el motor de canvas
    setTimelineBounds(
        preset.linea_tiempo_ar.frame_start,
        preset.linea_tiempo_ar.frame_end,
        preset.linea_tiempo_ar.duration,
        preset.linea_tiempo_ar.fps
    );

    // 3. Activar el botón de la plantilla adecuada
    dom.tmplButtons.forEach(btn => {
        if (btn.dataset.template === preset.tipo_efecto) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    setCurrentTemplate(preset.tipo_efecto);

    // 4. Restaurar fotos cargadas (base64)
    if (preset.configuracion_visual.avatar_url) {
        dom.avatarPreviewImg.src = preset.configuracion_visual.avatar_url;
        dom.avatarPrompt.classList.add('hidden');
        dom.avatarPreviewContainer.classList.remove('hidden');

        // Cargar en canvas memory
        const img = new Image();
        img.onload = () => setAvatarImage(img);
        img.src = preset.configuracion_visual.avatar_url;
    } else {
        setAvatarImage(null);
        dom.avatarPreviewContainer.classList.add('hidden');
        dom.avatarPrompt.classList.remove('hidden');
        dom.avatarInput.value = '';
    }

    if (preset.configuracion_visual.glove_url) {
        dom.glovePreviewImg.src = preset.configuracion_visual.glove_url;
        dom.glovePrompt.classList.add('hidden');
        dom.glovePreviewContainer.classList.remove('hidden');

        // Cargar en canvas memory
        const img = new Image();
        img.onload = () => {
            setGloveImage(img);
            // También inyectar textura en Three.js si está cargado
            if (window.THREE) {
                import('./three-ar.js').then(m => m.setGloveTextureFromDataURL(preset.configuracion_visual.glove_url));
            }
        };
        img.src = preset.configuracion_visual.glove_url;
    } else {
        setGloveImage(null);
        dom.glovePreviewContainer.classList.add('hidden');
        dom.glovePrompt.classList.remove('hidden');
        dom.gloveInput.value = '';
        if (window.THREE) {
            // Limpiar textura
            import('./three-ar.js').then(m => m.clearGloveTexture());
        }
    }

    // 5. Cambiar a la vista de estudio e iniciar reproducción
    showView('view-studio');
    startAnimation();

    // Sincronizar colores en 3D
    updateColorsFromDOM();
    rebuildGloveMesh();
}

// Clona un preset existente y le añade un sufijo de Copia
function duplicatePreset(id) {
    let presets = JSON.parse(localStorage.getItem('winsnipe_presets')) || [];
    const presetIndex = presets.findIndex(p => p.id_efecto === id);
    if (presetIndex === -1) return;

    const sourcePreset = presets[presetIndex];
    const duplicated = JSON.parse(JSON.stringify(sourcePreset)); // Clon profundo

    duplicated.id_efecto = 'winsnipe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    duplicated.nombre = `${sourcePreset.nombre} (Copia)`;

    presets.push(duplicated);
    localStorage.setItem('winsnipe_presets', JSON.stringify(presets));
    
    renderSavedPresets();
}

// Elimina un preset por ID
function deletePreset(id) {
    let presets = JSON.parse(localStorage.getItem('winsnipe_presets')) || [];
    presets = presets.filter(p => p.id_efecto !== id);
    localStorage.setItem('winsnipe_presets', JSON.stringify(presets));
    
    renderSavedPresets();
}

// Utilidades auxiliares
function hexToRgbA(hex, alpha) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length == 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return 'rgba(255, 0, 80, ' + alpha + ')';
}
}
