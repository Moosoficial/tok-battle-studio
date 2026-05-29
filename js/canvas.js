import { dom } from './config.js';
import { loadGloveTexture, clearGloveTexture, updateColorsFromDOM } from './three-ar.js';

let currentTemplate = 'tap';
let isPlaying = true;
let isExporting = false;
let duration = 10;
let fps = 60;
let frameStart = 0;
let frameEnd = 600;

let startTime = Date.now();
let elapsedMs = 0;
let animationFrameId = null;

let avatarImage = null;
let gloveImage = null;
let particles = [];
let floatingLikes = [];

const canvasWidth = 1080;
const canvasHeight = 1920;

export function startAnimation() {
    isPlaying = true;
    startTime = Date.now() - elapsedMs;
    if(dom.btnPlayPauseIcon) dom.btnPlayPauseIcon.textContent = '⏸';
    cancelAnimationFrame(animationFrameId);
    animate();
}

export function stopAnimation() {
    isPlaying = false;
    if(dom.btnPlayPauseIcon) dom.btnPlayPauseIcon.textContent = '▶';
    cancelAnimationFrame(animationFrameId);
}

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
    return `rgba(255,255,255,${alpha})`;
}

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
    // ----------------------------------------------------------------------
    class Particle {
        constructor(x, y, color, isVersusRed = false) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = Math.random() * 8 + 4;
            
            if (currentTemplate === 'versus') {
                // Dirección de fuego/rayos según el lado
                this.vx = isVersusRed ? (Math.random() * 3 + 1) : -(Math.random() * 3 + 1);
                this.vy = -(Math.random() * 5 + 3);
            } else {
                // Expansión radial
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
            }
            
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            this.glow = Math.random() * 15 + 5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw(c) {
            c.save();
            c.globalAlpha = this.alpha;
            c.shadowBlur = this.glow;
            c.shadowColor = this.color;
            c.fillStyle = this.color;
            c.beginPath();
            c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            c.fill();
            c.restore();
        }
    }

    class FloatingLike {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = -(Math.random() * 8 + 6);
            this.size = Math.random() * 20 + 20;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.01;
            this.label = `+${Math.floor(Math.random() * 9) + 1}`;
            
            // Elegir tipo: Corazón o Número flotante
            this.type = Math.random() > 0.4 ? 'heart' : 'number';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw(c) {
            c.save();
            c.globalAlpha = this.alpha;
            c.shadowBlur = 10;
            c.shadowColor = this.color;
            
            if (this.type === 'heart') {
                c.fillStyle = this.color;
                // Dibujar corazón simplificado en Canvas
                c.beginPath();
                const d = this.size;
                c.moveTo(this.x, this.y + d / 4);
                c.quadraticCurveTo(this.x, this.y, this.x - d / 2, this.y);
                c.quadraticCurveTo(this.x - d, this.y, this.x - d, this.y + d / 2);
                c.quadraticCurveTo(this.x - d, this.y + d, this.x, this.y + d * 1.3);
                c.quadraticCurveTo(this.x + d, this.y + d, this.x + d, this.y + d / 2);
                c.quadraticCurveTo(this.x + d, this.y, this.x + d / 2, this.y);
                c.quadraticCurveTo(this.x, this.y, this.x, this.y + d / 4);
                c.closePath();
                c.fill();
            } else {
                c.fillStyle = '#ffffff';
                c.font = `bold ${this.size * 1.2}px 'Space Grotesk'`;
                c.textAlign = 'center';
                c.fillText(this.label, this.x, this.y);
            }
            c.restore();
        }
    }



    // ----------------------------------------------------------------------
    // 6. MOTOR DE DIBUJO DEL CANVAS (ANIMACIONES 9:16)
    // ----------------------------------------------------------------------
    function drawBackground(timeSec) {
        // Fondo base oscuro y cibernético
        dom.ctx.fillStyle = '#050508';
        dom.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Añadir gradiente de ambientación superior e inferior
        const grad = dom.ctx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, hexToRgbA(dom.colorPrimary.value, 0.1));
        grad.addColorStop(0.5, '#050508');
        grad.addColorStop(1, hexToRgbA(dom.colorSecondary.value, 0.15));
        dom.ctx.fillStyle = grad;
        dom.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Rejilla de fondo dinámica (cyberpunk grid)
        dom.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        dom.ctx.lineWidth = 2;
        const gridSpacing = 80;
        
        // Efecto de perspectiva y movimiento vertical
        const yOffset = (timeSec * 150) % gridSpacing;
        
        for (let x = 0; x < canvasWidth; x += gridSpacing) {
            dom.ctx.beginPath();
            dom.ctx.moveTo(x, 0);
            dom.ctx.lineTo(x, canvasHeight);
            dom.ctx.stroke();
        }
        for (let y = yOffset; y < canvasHeight; y += gridSpacing) {
            dom.ctx.beginPath();
            dom.ctx.moveTo(0, y);
            dom.ctx.lineTo(canvasWidth, y);
            dom.ctx.stroke();
        }
    }

    function drawStreamerAvatar(x, y, radius) {
        if (!avatarImage) {
            // Dibujar marcador de posición si no hay avatar subido
            dom.ctx.save();
            dom.ctx.shadowBlur = 30;
            dom.ctx.shadowColor = dom.colorPrimary.value;
            dom.ctx.fillStyle = '#121217';
            dom.ctx.strokeStyle = dom.colorPrimary.value;
            dom.ctx.lineWidth = 8;
            
            dom.ctx.beginPath();
            dom.ctx.arc(x, y, radius, 0, Math.PI * 2);
            dom.ctx.fill();
            dom.ctx.stroke();

            // Dibujar silueta simple de usuario
            dom.ctx.fillStyle = dom.colorSecondary.value;
            dom.ctx.beginPath();
            dom.ctx.arc(x, y - 10, radius * 0.4, 0, Math.PI * 2);
            dom.ctx.fill();
            dom.ctx.beginPath();
            dom.ctx.arc(x, y + radius * 0.8, radius * 0.8, Math.PI, Math.PI * 2);
            dom.ctx.fill();
            dom.ctx.restore();
            return;
        }

        // Si hay avatar, recortarlo en círculo de forma fluida
        dom.ctx.save();
        
        // Brillo neón externo giratorio
        dom.ctx.shadowBlur = 40;
        dom.ctx.shadowColor = dom.colorPrimary.value;
        dom.ctx.strokeStyle = dom.colorPrimary.value;
        dom.ctx.lineWidth = 10;
        
        // Línea giratoria neón doble
        const rotationAngle = (Date.now() / 1000) * Math.PI;
        dom.ctx.beginPath();
        dom.ctx.arc(x, y, radius + 8, rotationAngle, rotationAngle + Math.PI * 0.8);
        dom.ctx.stroke();
        dom.ctx.strokeStyle = dom.colorSecondary.value;
        dom.ctx.beginPath();
        dom.ctx.arc(x, y, radius + 8, rotationAngle + Math.PI, rotationAngle + Math.PI * 1.8);
        dom.ctx.stroke();

        // Recorte circular del avatar
        dom.ctx.beginPath();
        dom.ctx.arc(x, y, radius, 0, Math.PI * 2);
        dom.ctx.clip();
        
        // Centrar y reescalar la imagen dentro del círculo (object-fit: cover manual)
        const aspect = avatarImage.width / avatarImage.height;
        let drawWidth, drawHeight, sx, sy;
        
        if (aspect > 1) {
            drawHeight = radius * 2;
            drawWidth = drawHeight * aspect;
            sx = x - drawWidth / 2;
            sy = y - radius;
        } else {
            drawWidth = radius * 2;
            drawHeight = drawWidth / aspect;
            sx = x - radius;
            sy = y - drawHeight / 2;
        }
        
        dom.ctx.drawImage(avatarImage, sx, sy, drawWidth, drawHeight);
        dom.ctx.restore();
    }

    function drawCustomTexts(titleY, subtitleY) {
        // TEXTO PRINCIPAL (Estilo Neón Vibrante)
        const titleText = dom.inputTitle.value.toUpperCase();
        dom.ctx.save();
        dom.ctx.font = "extrabold 68px 'Space Grotesk'";
        dom.ctx.textAlign = 'center';
        
        // Brillo Neón
        dom.ctx.shadowColor = dom.colorPrimary.value;
        dom.ctx.shadowBlur = 30;
        dom.ctx.fillStyle = '#ffffff';
        dom.ctx.fillText(titleText, canvasWidth / 2, titleY);
        dom.ctx.shadowBlur = 10;
        dom.ctx.fillText(titleText, canvasWidth / 2, titleY);
        
        // Borde fino para realce
        dom.ctx.strokeStyle = dom.colorPrimary.value;
        dom.ctx.lineWidth = 2;
        dom.ctx.strokeText(titleText, canvasWidth / 2, titleY);
        dom.ctx.restore();

        // TEXTO SECUNDARIO (Subtítulo dinámico)
        const subText = dom.inputSubtitle.value.toUpperCase();
        dom.ctx.save();
        dom.ctx.font = "bold 44px 'Outfit'";
        dom.ctx.textAlign = 'center';
        dom.ctx.shadowColor = dom.colorSecondary.value;
        dom.ctx.shadowBlur = 20;
        dom.ctx.fillStyle = dom.colorSecondary.value;
        
        // Dibujar caja de fondo translúcida para legibilidad
        const textWidth = dom.ctx.measureText(subText).width;
        dom.ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
        dom.ctx.shadowBlur = 0;
        dom.ctx.beginPath();
        dom.ctx.roundRect(canvasWidth / 2 - textWidth / 2 - 30, subtitleY - 50, textWidth + 60, 76, 16);
        dom.ctx.fill();

        dom.ctx.fillStyle = '#ffffff';
        dom.ctx.shadowColor = dom.colorSecondary.value;
        dom.ctx.shadowBlur = 15;
        dom.ctx.fillText(subText, canvasWidth / 2, subtitleY);
        dom.ctx.restore();
    }

    // ----------------------------------------------------------------------
    // 7. DIBUJADO DE LAS PLANTILLAS ESPECÍFICAS
    // ----------------------------------------------------------------------
    
    // Plantilla 1: DOBLE TAP (Likes y pulsos en pantalla)
    function drawTemplateTap(timeSec) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Generar pulsos expansivos de ondas concéntricas periódicamente
        const pulseCycle = (timeSec * 1.5) % 1.0; // Ciclo de 0 a 1
        
        dom.ctx.save();
        dom.ctx.shadowBlur = 20 + pulseCycle * 30;
        dom.ctx.shadowColor = dom.colorPrimary.value;
        
        // Dibujar 3 aros concéntricos de pulso neón
        for (let i = 0; i < 3; i++) {
            const offsetCycle = (pulseCycle + i * 0.3) % 1.0;
            dom.ctx.strokeStyle = hexToRgbA(dom.colorPrimary.value, 1 - offsetCycle);
            dom.ctx.lineWidth = 12 - (offsetCycle * 8);
            dom.ctx.beginPath();
            dom.ctx.arc(centerX, centerY + 100, 100 + offsetCycle * 250, 0, Math.PI * 2);
            dom.ctx.stroke();
        }
        dom.ctx.restore();

        // Icono de Dedo Táctil animado (sube y baja simulando tap tap)
        const tapOffset = Math.abs(Math.sin(timeSec * Math.PI * 3.5)) * 40;
        dom.ctx.save();
        dom.ctx.shadowBlur = 20;
        dom.ctx.shadowColor = dom.colorSecondary.value;
        dom.ctx.fillStyle = '#ffffff';
        
        // Dibujar un círculo indicador donde ocurre el toque
        dom.ctx.fillStyle = hexToRgbA(dom.colorSecondary.value, 0.4);
        dom.ctx.beginPath();
        dom.ctx.arc(centerX, centerY + 100, 45, 0, Math.PI * 2);
        dom.ctx.fill();
        
        // Dedo/Manito emoji grande
        dom.ctx.font = "140px 'Outfit'";
        dom.ctx.textAlign = 'center';
        dom.ctx.textBaseline = 'middle';
        dom.ctx.fillText("👆", centerX + 30, centerY + 160 - tapOffset);
        dom.ctx.restore();

        // Disparar partículas de likes y corazones simulados
        if (Math.random() < 0.15) {
            floatingLikes.push(new FloatingLike(
                centerX + (Math.random() - 0.5) * 200,
                centerY + 100 + (Math.random() - 0.5) * 100,
                Math.random() > 0.5 ? dom.colorPrimary.value : dom.colorSecondary.value
            ));
        }

        // Actualizar y dibujar corazones
        floatingLikes = floatingLikes.filter(like => {
            like.update();
            like.draw(dom.ctx);
            return like.alpha > 0.05;
        });

        // Dibujar Avatar centrado superior
        drawStreamerAvatar(centerX, centerY - 380, 140);
        
        // Textos del usuario
        drawCustomTexts(centerY - 130, centerY - 40);
    }

    // Plantilla 2: EL GUANTE DE PODER (x5 Multiplicador con Cuenta Regresiva)
    function drawTemplateGlove(timeSec) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Efecto de aura de fuego al fondo
        const firePulse = Math.sin(timeSec * Math.PI * 2) * 20;
        const radGrad = dom.ctx.createRadialGradient(centerX, centerY - 100, 50, centerX, centerY - 100, 260 + firePulse);
        radGrad.addColorStop(0, hexToRgbA(dom.colorPrimary.value, 0.4));
        radGrad.addColorStop(0.5, hexToRgbA(dom.colorSecondary.value, 0.15));
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        dom.ctx.fillStyle = radGrad;
        dom.ctx.beginPath();
        dom.ctx.arc(centerX, centerY - 100, 350, 0, Math.PI * 2);
        dom.ctx.fill();

        // Dibujar Avatar más pequeño en la cabecera superior
        drawStreamerAvatar(centerX, centerY - 520, 110);

        // Guantelete Gigante de Boxeo (Emoji con brillo extremo y escala dinámica)
        const gloveScale = 1.0 + Math.abs(Math.sin(timeSec * Math.PI * 2)) * 0.12;
        dom.ctx.save();
        dom.ctx.translate(centerX, centerY - 120);
        dom.ctx.scale(gloveScale, gloveScale);
        dom.ctx.shadowBlur = 40;
        dom.ctx.shadowColor = dom.colorPrimary.value;
        if (gloveImage) {
            dom.ctx.drawImage(gloveImage, -130, -130, 260, 260);
        } else {
            dom.ctx.font = "260px 'Outfit'";
            dom.ctx.textAlign = 'center';
            dom.ctx.textBaseline = 'middle';
            dom.ctx.fillText("🥊", 0, 0);
        }
        dom.ctx.restore();

        // Badge neón "x5" parpadeante
        const flashGlow = Math.floor(timeSec * 6) % 2 === 0;
        dom.ctx.save();
        dom.ctx.font = "extrabold 120px 'Space Grotesk'";
        dom.ctx.textAlign = 'center';
        dom.ctx.shadowColor = dom.colorSecondary.value;
        dom.ctx.shadowBlur = flashGlow ? 45 : 15;
        dom.ctx.fillStyle = flashGlow ? '#ffffff' : dom.colorSecondary.value;
        dom.ctx.fillText("MULTIPLIQUEN X5", centerX, centerY + 180);
        dom.ctx.restore();

        // Cuenta regresiva del guante (Ej: 30 segundos recurrentes)
        const remainingSeconds = Math.max(0, Math.ceil(duration - timeSec));
        dom.ctx.save();
        dom.ctx.font = "bold 90px 'Space Grotesk'";
        dom.ctx.textAlign = 'center';
        dom.ctx.shadowBlur = 20;
        dom.ctx.shadowColor = '#ffffff';
        dom.ctx.fillStyle = '#ffffff';
        
        // Dibujar círculo de progreso alrededor del temporizador
        dom.ctx.strokeStyle = dom.colorSecondary.value;
        dom.ctx.lineWidth = 14;
        dom.ctx.beginPath();
        dom.ctx.arc(centerX, centerY + 330, 90, -Math.PI / 2, (1.5 - (timeSec / duration) * 2) * Math.PI);
        dom.ctx.stroke();

        dom.ctx.fillText(`00:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`, centerX, centerY + 360);
        dom.ctx.restore();

        // Partículas orbitales del guante
        if (particles.length < 40) {
            particles.push(new Particle(centerX + (Math.random() - 0.5) * 150, centerY - 120 + (Math.random() - 0.5) * 150, dom.colorSecondary.value));
        }

        particles = particles.filter(p => {
            p.update();
            p.draw(dom.ctx);
            return p.alpha > 0.05;
        });

        // Textos del usuario
        drawCustomTexts(centerY + 530, centerY + 620);
    }

    // Plantilla 3: FUEGO CRUZADO VS (Pantalla dividida con efectos duales)
    function drawTemplateVersus(timeSec) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Dibujar fondo dividido en diagonal
        dom.ctx.save();
        
        // Lado Izquierdo (Cian / Azul Eléctrico)
        const leftGrad = dom.ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        leftGrad.addColorStop(0, '#001a33');
        leftGrad.addColorStop(0.5, '#003366');
        leftGrad.addColorStop(1, '#050508');
        dom.ctx.fillStyle = leftGrad;
        dom.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Lado Derecho (Rojo de Batalla / Rosa Eléctrico)
        dom.ctx.beginPath();
        dom.ctx.moveTo(canvasWidth, 0);
        dom.ctx.lineTo(0, canvasHeight);
        dom.ctx.lineTo(canvasWidth, canvasHeight);
        dom.ctx.closePath();
        
        const rightGrad = dom.ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        rightGrad.addColorStop(0, '#050508');
        rightGrad.addColorStop(0.5, '#3b0010');
        rightGrad.addColorStop(1, '#66001a');
        dom.ctx.fillStyle = rightGrad;
        dom.ctx.fill();
        dom.ctx.restore();

        // Rayo / División neón en la diagonal
        dom.ctx.save();
        dom.ctx.shadowBlur = 40;
        dom.ctx.shadowColor = '#ffffff';
        dom.ctx.strokeStyle = '#ffffff';
        dom.ctx.lineWidth = 14 + Math.sin(timeSec * 25) * 4; // Parpadeo salvaje de energía
        dom.ctx.beginPath();
        dom.ctx.moveTo(canvasWidth, 0);
        dom.ctx.lineTo(0, canvasHeight);
        dom.ctx.stroke();
        
        dom.ctx.strokeStyle = dom.colorSecondary.value;
        dom.ctx.lineWidth = 6;
        dom.ctx.stroke();
        dom.ctx.restore();

        // Disparar partículas de fuego y rayos desde la diagonal
        if (particles.length < 80) {
            const py = Math.random() * canvasHeight;
            const px = canvasWidth - (py * (canvasWidth / canvasHeight)); // Punto en la diagonal
            
            // Lado azul (hacia izquierda)
            particles.push(new Particle(px, py, dom.colorSecondary.value, false));
            // Lado rojo (hacia derecha)
            particles.push(new Particle(px, py, dom.colorPrimary.value, true));
        }

        particles = particles.filter(p => {
            p.update();
            p.draw(dom.ctx);
            return p.alpha > 0.05;
        });

        // Título de la Batalla en cabecera
        dom.ctx.save();
        dom.ctx.font = "extrabold 85px 'Space Grotesk'";
        dom.ctx.textAlign = 'center';
        dom.ctx.shadowColor = dom.colorPrimary.value;
        dom.ctx.shadowBlur = 30;
        dom.ctx.fillStyle = '#ffffff';
        dom.ctx.fillText("BATALLA OFICIAL", centerX, centerY - 620);
        dom.ctx.restore();

        // --- MARCADOR PREMIUM DE BATALLA DIRECTO EN CANVAS ---
        dom.ctx.save();
        const scoreOsc = Math.sin(timeSec * 2.5) * 0.15; // -15% a +15%
        const blueRatio = 0.5 + scoreOsc;
        const barWidth = 800;
        const barHeight = 60;
        const barX = centerX - barWidth / 2; // 140
        const barY = centerY - 480; // 480
        
        // Crear contorno cápsula
        dom.ctx.beginPath();
        dom.ctx.roundRect(barX, barY, barWidth, barHeight, 30);
        dom.ctx.clip();
        
        // Dibujar fondo base del bar
        dom.ctx.fillStyle = '#0a0a0f';
        dom.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Lado azul (Izquierda)
        const blueW = barWidth * blueRatio;
        const blueGrad = dom.ctx.createLinearGradient(barX, barY, barX + blueW, barY);
        blueGrad.addColorStop(0, '#00f2fe');
        blueGrad.addColorStop(1, '#0055ff');
        dom.ctx.fillStyle = blueGrad;
        dom.ctx.fillRect(barX, barY, blueW, barHeight);
        
        // Lado rojo (Derecha)
        const redGrad = dom.ctx.createLinearGradient(barX + blueW, barY, barX + barWidth, barY);
        redGrad.addColorStop(0, '#ff0050');
        redGrad.addColorStop(1, '#ff00ff');
        dom.ctx.fillStyle = redGrad;
        dom.ctx.fillRect(barX + blueW, barY, barWidth - blueW, barHeight);
        dom.ctx.restore();
        
        // Bordes y textos del marcador
        dom.ctx.save();
        dom.ctx.beginPath();
        dom.ctx.roundRect(barX, barY, barWidth, barHeight, 30);
        dom.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        dom.ctx.lineWidth = 4;
        dom.ctx.stroke();
        
        dom.ctx.font = "bold 32px 'Space Grotesk'";
        dom.ctx.shadowBlur = 10;
        
        // Score Azul
        dom.ctx.fillStyle = '#ffffff';
        dom.ctx.shadowColor = '#00f2fe';
        dom.ctx.textAlign = 'left';
        const leftText = Math.floor(blueRatio * 50000);
        const leftFormatted = leftText >= 1000 ? (leftText/1000).toFixed(1) + 'k' : leftText;
        dom.ctx.fillText(leftFormatted, barX + 30, barY + 42);
        
        // Score Rojo
        dom.ctx.shadowColor = '#ff0050';
        dom.ctx.textAlign = 'right';
        const rightText = Math.floor((1 - blueRatio) * 50000);
        const rightFormatted = rightText >= 1000 ? (rightText/1000).toFixed(1) + 'k' : rightText;
        dom.ctx.fillText(rightFormatted, barX + barWidth - 30, barY + 42);
        dom.ctx.restore();
        
        // Temporizador central en canvas
        dom.ctx.save();
        dom.ctx.beginPath();
        dom.ctx.roundRect(centerX - 60, barY + 8, 120, 44, 22);
        dom.ctx.fillStyle = '#050508';
        dom.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        dom.ctx.lineWidth = 4;
        dom.ctx.fill();
        dom.ctx.stroke();
        
        dom.ctx.font = "bold 26px 'Space Grotesk'";
        dom.ctx.fillStyle = '#ffffff';
        dom.ctx.textAlign = 'center';
        dom.ctx.textBaseline = 'middle';
        const canvasRemaining = Math.max(0, Math.ceil(duration - timeSec));
        dom.ctx.fillText(`00:${canvasRemaining < 10 ? '0' + canvasRemaining : canvasRemaining}`, centerX, barY + 30);
        dom.ctx.restore();

        // Logo del "VS" gigante y brillante en el centro
        const vsPulse = 1.0 + Math.sin(timeSec * Math.PI * 4) * 0.08;
        dom.ctx.save();
        dom.ctx.translate(centerX, centerY - 150);
        dom.ctx.scale(vsPulse, vsPulse);
        
        // Círculo de poder detrás del VS
        const circleGrad = dom.ctx.createRadialGradient(0, 0, 50, 0, 0, 180);
        circleGrad.addColorStop(0, '#ffffff');
        circleGrad.addColorStop(0.3, dom.colorPrimary.value);
        circleGrad.addColorStop(1, 'rgba(0,0,0,0)');
        dom.ctx.fillStyle = circleGrad;
        dom.ctx.beginPath();
        dom.ctx.arc(0, 0, 200, 0, Math.PI * 2);
        dom.ctx.fill();

        dom.ctx.shadowBlur = 50;
        dom.ctx.shadowColor = '#ffffff';
        dom.ctx.fillStyle = '#ffffff';
        dom.ctx.font = "extrabold 220px 'Space Grotesk'";
        dom.ctx.textAlign = 'center';
        dom.ctx.textBaseline = 'middle';
        dom.ctx.fillText("VS", 0, 0);
        dom.ctx.strokeStyle = '#000000';
        dom.ctx.lineWidth = 14;
        dom.ctx.strokeText("VS", 0, 0);
        dom.ctx.restore();

        // Avatares de los dos lados
        // Lado Izquierdo (Streamer actual)
        drawStreamerAvatar(centerX - 240, centerY + 200, 130);
        // Lado Derecho (Rival)
        dom.ctx.save();
        dom.ctx.shadowBlur = 40;
        dom.ctx.shadowColor = dom.colorPrimary.value;
        dom.ctx.strokeStyle = dom.colorPrimary.value;
        dom.ctx.lineWidth = 10;
        dom.ctx.fillStyle = '#121217';
        dom.ctx.beginPath();
        dom.ctx.arc(centerX + 240, centerY + 200, 130, 0, Math.PI * 2);
        dom.ctx.fill();
        dom.ctx.stroke();
        // Emoji de rival por defecto
        dom.ctx.font = "130px 'Outfit'";
        dom.ctx.textAlign = 'center';
        dom.ctx.textBaseline = 'middle';
        dom.ctx.fillText("👑", centerX + 240, centerY + 200);
        dom.ctx.restore();

        // Textos inferiores personalizados
        drawCustomTexts(centerY + 550, centerY + 650);
    }

    // ----------------------------------------------------------------------
    // 8. BUCLE PRINCIPAL DE ANIMACIÓN Y CONTROL DE TIEMPO
    // ----------------------------------------------------------------------
    function animate() {
        if (!isPlaying && !isExporting) return;

        // Calcular el tiempo transcurrido
        const now = Date.now();
        elapsedMs = (now - startTime) % (duration * 1000);
        let timeSec = elapsedMs / 1000;

        // Limitar la reproducción al rango de frames clave
        let currentFrame = Math.floor(timeSec * fps);
        if (currentFrame > frameEnd || currentFrame < frameStart) {
            elapsedMs = (frameStart / fps) * 1000;
            startTime = Date.now() - elapsedMs;
            timeSec = elapsedMs / 1000;
        }

        // Actualizar etiqueta del reloj de reproducción
        const currentFormatted = formatTime(timeSec);
        const totalFormatted = formatTime(duration);
        dom.timeDisplay.textContent = `${currentFormatted} / ${totalFormatted}`;

        // Sincronizar temporizador de batalla en el celular mockup
        const remaining = Math.max(0, Math.ceil(duration - timeSec));
        if (dom.battleTimer) {
            dom.battleTimer.textContent = `00:${remaining < 10 ? '0' + remaining : remaining}`;
        }

        // Dibujar el fondo base
        drawBackground(timeSec);

        // Dibujar plantilla seleccionada
        if (currentTemplate === 'tap') {
            drawTemplateTap(timeSec);
        } else if (currentTemplate === 'glove') {
            drawTemplateGlove(timeSec);
        } else if (currentTemplate === 'versus') {
            drawTemplateVersus(timeSec);
        }

        animationFrameId = requestAnimationFrame(animate);
    }






export function initCanvas() {
    dom.canvas.width = canvasWidth;
    dom.canvas.height = canvasHeight;

    dom.colorPrimary.addEventListener('input', (e) => {
        e.target.nextElementSibling.style.backgroundColor = e.target.value;
        updateColorsFromDOM(); // Sincronizar en 3D
    });
    dom.colorSecondary.addEventListener('input', (e) => {
        e.target.nextElementSibling.style.backgroundColor = e.target.value;
        updateColorsFromDOM(); // Sincronizar en 3D
    });

    dom.avatarDropZone.addEventListener('click', () => dom.avatarInput.click());
    dom.avatarDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.avatarDropZone.style.borderColor = 'var(--color-primary)';
    });
    dom.avatarDropZone.addEventListener('dragleave', () => {
        dom.avatarDropZone.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    });
    dom.avatarDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dom.avatarDropZone.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleAvatarFile(e.dataTransfer.files[0]);
        }
    });

    dom.avatarInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleAvatarFile(e.target.files[0]);
        }
    });

    dom.btnRemoveAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarImage = null;
        dom.avatarPreviewContainer.classList.add('hidden');
        dom.avatarPrompt.classList.remove('hidden');
        dom.avatarInput.value = '';
    });

    function handleAvatarFile(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                avatarImage = img;
                dom.avatarPreviewImg.src = event.target.result;
                dom.avatarPrompt.classList.add('hidden');
                dom.avatarPreviewContainer.classList.remove('hidden');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // --- CARGADOR SEGURO DE GUANTES PERSONALIZADOS (MAGIC BYTES VALIDATION) ---
    if (dom.gloveDropZone && dom.gloveInput) {
        dom.gloveDropZone.addEventListener('click', () => dom.gloveInput.click());
        
        dom.gloveDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dom.gloveDropZone.style.borderColor = 'var(--color-primary)';
        });
        
        dom.gloveDropZone.addEventListener('dragleave', () => {
            dom.gloveDropZone.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        });
        
        dom.gloveDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dom.gloveDropZone.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleGloveFile(e.dataTransfer.files[0]);
            }
        });

        dom.gloveInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleGloveFile(e.target.files[0]);
            }
        });

        dom.btnRemoveGlove.addEventListener('click', (e) => {
            e.stopPropagation();
            gloveImage = null;
            dom.glovePreviewContainer.classList.add('hidden');
            dom.glovePrompt.classList.remove('hidden');
            dom.gloveInput.value = '';
            clearGloveTexture(); // Limpiar textura 3D
        });
    }

    function validatePNGMagicBytes(file, callback) {
        const reader = new FileReader();
        reader.onloadend = (e) => {
            if (e.target.readyState === FileReader.DONE) {
                const arr = new Uint8Array(e.target.result);
                // PNG signature bytes: 89 50 4E 47 0D 0A 1A 0A
                const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47 &&
                              arr[4] === 0x0D && arr[5] === 0x0A && arr[6] === 0x1A && arr[7] === 0x0A;
                callback(isPNG);
            }
        };
        const blob = file.slice(0, 8);
        reader.readAsArrayBuffer(blob);
    }

    function handleGloveFile(file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('¡Error! El archivo supera el tamaño máximo permitido de 5MB.');
            return;
        }

        validatePNGMagicBytes(file, (isValid) => {
            if (!isValid) {
                alert('¡Fallo de Seguridad (Magic Bytes)! El archivo subido no es una imagen PNG real y válida.');
                if (dom.gloveInput) dom.gloveInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    gloveImage = img;
                    dom.glovePreviewImg.src = event.target.result;
                    dom.glovePrompt.classList.add('hidden');
                    dom.glovePreviewContainer.classList.remove('hidden');
                    loadGloveTexture(file); // Cargar textura 3D
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    dom.btnPlayPause.addEventListener('click', () => {
        if (isPlaying) stopAnimation();
        else startAnimation();
    });

    dom.tmplButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.tmplButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTemplate = btn.dataset.template;
            
            if (currentTemplate === 'tap') {
                dom.inputTitle.value = "¡APOYEN LA FAMILIA!";
                dom.inputSubtitle.value = "¡TOCA LA PANTALLA RÁPIDO!";
                dom.colorPrimary.value = "#ff0050";
                dom.colorSecondary.value = "#00f2fe";
            } else if (currentTemplate === 'glove') {
                dom.inputTitle.value = "¡EL GUANTE AHORA!";
                dom.inputSubtitle.value = "¡ENVÍEN EL MULTIPLICADOR X5!";
                dom.colorPrimary.value = "#ffd700";
                dom.colorSecondary.value = "#ff0050";
            } else if (currentTemplate === 'versus') {
                dom.inputTitle.value = "¡BATALLA COMPLETA!";
                dom.inputSubtitle.value = "¡NADIE SE ME QUEDE FUERA!";
                dom.colorPrimary.value = "#ff3333";
                dom.colorSecondary.value = "#00f2fe";
            }
            
            dom.colorPrimary.nextElementSibling.style.backgroundColor = dom.colorPrimary.value;
            dom.colorSecondary.nextElementSibling.style.backgroundColor = dom.colorSecondary.value;
            
            particles = [];
            floatingLikes = [];
        });
    });

    // Inicializar límites de frames
    if (dom.inputFrameStart && dom.inputFrameEnd) {
        const total = duration * fps;
        dom.inputFrameStart.max = total;
        dom.inputFrameEnd.max = total;
        dom.inputFrameEnd.value = total;
        frameStart = 0;
        frameEnd = total;

        dom.inputFrameStart.addEventListener('input', (e) => {
            frameStart = Math.max(0, Math.min(frameEnd - 1, parseInt(e.target.value) || 0));
            e.target.value = frameStart;
            elapsedMs = (frameStart / fps) * 1000;
            startTime = Date.now() - elapsedMs;
        });

        dom.inputFrameEnd.addEventListener('input', (e) => {
            const maxVal = duration * fps;
            frameEnd = Math.max(frameStart + 1, Math.min(maxVal, parseInt(e.target.value) || maxVal));
            e.target.value = frameEnd;
            elapsedMs = (frameStart / fps) * 1000;
            startTime = Date.now() - elapsedMs;
        });
    }

    dom.selectDuration.addEventListener('change', (e) => {
        duration = parseInt(e.target.value);
        elapsedMs = 0;
        startTime = Date.now();
        
        const total = duration * fps;
        if (dom.inputFrameStart && dom.inputFrameEnd) {
            dom.inputFrameStart.max = total;
            dom.inputFrameEnd.max = total;
            dom.inputFrameEnd.value = total;
        }
        frameStart = 0;
        frameEnd = total;
    });

    dom.selectFps.addEventListener('change', (e) => {
        fps = parseInt(e.target.value);
        
        const total = duration * fps;
        if (dom.inputFrameStart && dom.inputFrameEnd) {
            dom.inputFrameStart.max = total;
            dom.inputFrameEnd.max = total;
            dom.inputFrameEnd.value = total;
        }
        frameStart = 0;
        frameEnd = total;
    });

    // ----------------------------------------------------------------------
    // 10. MOTOR DE EXPORTACIÓN Y GRABACIÓN (MediaRecorder)
    // ----------------------------------------------------------------------
    if (dom.btnExport) {
        dom.btnExport.addEventListener('click', async () => {
            if (isExporting) return;
            
            isExporting = true;
            isPlaying = false;
            cancelAnimationFrame(animationFrameId);
            
            // Mostrar modal de progreso
            if (dom.exportProgressContainer) dom.exportProgressContainer.classList.remove('hidden');
            if (dom.exportProgressFill) dom.exportProgressFill.style.width = '0%';
            if (dom.exportProgressText) dom.exportProgressText.textContent = '0%';

            // Detener audio o reseteos previos
            elapsedMs = 0;
            let exportFrame = frameStart;
            const totalFrames = frameEnd;
            
            // Capturar flujo del Canvas en alta resolución
            const stream = dom.canvas.captureStream(fps);
            
            let recorder;
            const chunks = [];

            try {
                recorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9,opus',
                    videoBitsPerSecond: 8000000
                });
            } catch (e) {
                recorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp8',
                    videoBitsPerSecond: 5000000
                });
            }

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `TokBattle_${currentTemplate}_${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                setTimeout(() => {
                    if (dom.exportProgressContainer) dom.exportProgressContainer.classList.add('hidden');
                    isExporting = false;
                    isPlaying = true;
                    startTime = Date.now();
                    animate();
                }, 1000);
            };

            recorder.start();

            function drawExportFrame() {
                if (exportFrame > totalFrames) {
                    recorder.stop();
                    return;
                }

                const theoreticalTimeSec = (exportFrame / fps);
                
                drawBackground(theoreticalTimeSec);
                if (currentTemplate === 'tap') {
                    drawTemplateTap(theoreticalTimeSec);
                } else if (currentTemplate === 'glove') {
                    drawTemplateGlove(theoreticalTimeSec);
                } else if (currentTemplate === 'versus') {
                    drawTemplateVersus(theoreticalTimeSec);
                }

                const range = frameEnd - frameStart || 1;
                const percent = Math.floor(((exportFrame - frameStart) / range) * 100);
                if (dom.exportProgressFill) dom.exportProgressFill.style.width = `${percent}%`;
                if (dom.exportProgressText) dom.exportProgressText.textContent = `${percent}%`;

                exportFrame++;
                
                setTimeout(drawExportFrame, 1000 / fps);
            }

            drawExportFrame();
        });
    }
}

// Getters y Setters para Gestión de Plantillas
export function getAvatarImage() { return avatarImage; }
export function setAvatarImage(img) { avatarImage = img; }
export function getGloveImage() { return gloveImage; }
export function setGloveImage(img) { gloveImage = img; }
export function getTimelineBounds() { return { start: frameStart, end: frameEnd, duration, fps }; }
export function setTimelineBounds(start, end, dur, f) {
    frameStart = start;
    frameEnd = end;
    duration = dur;
    fps = f;
}
export function getCurrentTemplate() { return currentTemplate; }
export function setCurrentTemplate(template) { currentTemplate = template; }
