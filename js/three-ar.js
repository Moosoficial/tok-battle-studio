import { dom } from './config.js';
import { state } from './state.js';

let scene, camera, renderer;
let mainGroup, handGroup, gloveGroup, particlesGroup;
let animationFrameId = null;
let isRotating = false;
let previousMousePosition = { x: 0, y: 0 };
let textureLoader = new THREE.TextureLoader();
let gloveTexture = null;

// Materiales para poder actualizarlos dinámicamente
let gloveMaterial, handMaterial, particleMaterial, glowLight;

export function initThreeAR() {
    if (!dom.canvas3DContainer) return;
    if (scene) return; // Evitar inicializar dos veces

    // 1. Crear Escena
    scene = new THREE.Scene();

    // 2. Crear Cámara (FOV, Aspecto, Near, Far)
    const rect = dom.canvas3DContainer.getBoundingClientRect();
    camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);

    // 3. Crear Renderizador con Canal Alfa (Transparencia)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(rect.width, rect.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    dom.canvas3DContainer.appendChild(renderer.domElement);

    // 4. Luces del Entorno Cyberpunk
    const ambientLight = new THREE.AmbientLight(0x05050a, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Luz de brillo neón focalizado
    glowLight = new THREE.PointLight(0xff0050, 4.0, 10);
    glowLight.position.set(0, 0.5, 1);
    scene.add(glowLight);

    // 5. Grupo Principal
    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 6. Construir Maniquí de Mano Holográfico (Cyberpunk Hologram Mesh)
    handGroup = new THREE.Group();
    mainGroup.add(handGroup);

    handMaterial = new THREE.MeshPhongMaterial({
        color: 0x00f2fe,
        emissive: 0x0055ff,
        emissiveIntensity: 0.35,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });

    // Antebrazo
    const forearmGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.6, 8, 4);
    const forearm = new THREE.Mesh(forearmGeo, handMaterial);
    forearm.position.y = -1.2;
    handGroup.add(forearm);

    // Muñeca / Base
    const wristGeo = new THREE.BoxGeometry(0.6, 0.25, 0.4);
    const wrist = new THREE.Mesh(wristGeo, handMaterial);
    wrist.position.y = -0.3;
    handGroup.add(wrist);

    // Palma de la mano
    const palmGeo = new THREE.BoxGeometry(0.8, 0.7, 0.35);
    const palm = new THREE.Mesh(palmGeo, handMaterial);
    palm.position.y = 0.15;
    handGroup.add(palm);

    // Dedos estilizados en puño (Cilindros horizontales curvados)
    const fingerMaterial = handMaterial.clone();
    fingerMaterial.opacity = 0.8;
    
    for (let i = 0; i < 4; i++) {
        const fingerGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.65, 8);
        const finger = new THREE.Mesh(fingerGeo, fingerMaterial);
        finger.rotation.z = Math.PI / 2;
        finger.position.set(-0.3 + i * 0.2, 0.45, 0.1);
        handGroup.add(finger);
    }
    // Pulgar
    const thumbGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.45, 8);
    const thumb = new THREE.Mesh(thumbGeo, fingerMaterial);
    thumb.rotation.z = -Math.PI / 4;
    thumb.position.set(0.45, 0.1, 0.1);
    handGroup.add(thumb);

    // 7. Construir Guantelete / Guante de Boxeo Neón 3D
    gloveGroup = new THREE.Group();
    gloveGroup.position.set(0, 0.25, 0.1); // Posicionado sobre la palma/puño
    mainGroup.add(gloveGroup);

    rebuildGloveMesh();

    // 8. Sistema de Partículas Orbitales (Efecto Tornado de Chispas)
    particlesGroup = new THREE.Group();
    mainGroup.add(particlesGroup);

    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Inicializar posiciones en un patrón espiral orbital
        const theta = Math.random() * Math.PI * 2;
        const radius = 0.6 + Math.random() * 0.8;
        const height = -1.2 + Math.random() * 2.4;

        positions[i * 3] = radius * Math.cos(theta);
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = radius * Math.sin(theta);

        // Almacenar velocidades personalizadas (rotación, velocidad ascendente)
        velocities.push({
            speed: 0.8 + Math.random() * 1.5,
            upSpeed: 0.4 + Math.random() * 0.8,
            radiusSpeed: 0.1 + Math.random() * 0.2,
            initialRadius: radius
        });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    particleMaterial = new THREE.PointsMaterial({
        color: 0xff0050,
        size: 0.08,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const sparks = new THREE.Points(particleGeometry, particleMaterial);
    particlesGroup.add(sparks);

    // 9. Manejadores de Eventos para Arrastre / Rotación 3D del Usuario
    setupMouseInteraction();

    // Sincronizar colores iniciales
    updateColorsFromDOM();
}

// Reconstruye el guante neón según si hay una textura cargada o no
export function rebuildGloveMesh() {
    if (!gloveGroup) return;

    // Limpiar hijos anteriores
    while (gloveGroup.children.length > 0) {
        gloveGroup.remove(gloveGroup.children[0]);
    }

    gloveMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0050,
        emissive: 0x990033,
        emissiveIntensity: 0.6,
        shininess: 90,
        transparent: true,
        opacity: 0.9
    });

    const canvasGloveInput = document.getElementById('glove-preview-img');
    const hasUploadedGlove = canvasGloveInput && canvasGloveInput.src && !canvasGloveInput.parentElement.classList.contains('hidden');

    if (hasUploadedGlove && gloveTexture) {
        // Renderizar un plano 3D con la textura del guante subido por el streamer
        const planeGeo = new THREE.PlaneGeometry(1.6, 1.6);
        const planeMat = new THREE.MeshBasicMaterial({
            map: gloveTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: true
        });
        const planeMesh = new THREE.Mesh(planeGeo, planeMat);
        planeMesh.position.set(0, 0, 0.2); // Levemente hacia adelante
        gloveGroup.add(planeMesh);

        // Brillo exterior neón circular de fondo
        const glowGeo = new THREE.RingGeometry(0.8, 0.9, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x00f2fe,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const ringGlow = new THREE.Mesh(glowGeo, glowMat);
        ringGlow.position.set(0, 0, 0.05);
        gloveGroup.add(ringGlow);

    } else {
        // Renderizar el Guante 3D Neón oficial de TokBattle por defecto (alta fidelidad geométrica)
        
        // Cuerpo principal del guante (Esfera aplastada)
        const bodyGeo = new THREE.SphereGeometry(0.5, 32, 32);
        bodyGeo.scale(1.0, 1.25, 0.85);
        const gloveBody = new THREE.Mesh(bodyGeo, gloveMaterial);
        gloveBody.castShadow = true;
        gloveBody.receiveShadow = true;
        gloveGroup.add(gloveBody);

        // Dedo pulgar del guante
        const thumbGeo = new THREE.SphereGeometry(0.18, 16, 16);
        thumbGeo.scale(1.2, 0.8, 0.8);
        const gloveThumb = new THREE.Mesh(thumbGeo, gloveMaterial);
        gloveThumb.position.set(0.38, -0.15, 0.15);
        gloveThumb.rotation.set(0, -Math.PI / 6, Math.PI / 8);
        gloveGroup.add(gloveThumb);

        // Banda protectora de la muñeca (Cilindro neón)
        const wristBandGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.4, 16);
        const wristBandMaterial = new THREE.MeshPhongMaterial({
            color: 0x00f2fe,
            emissive: 0x0088cc,
            emissiveIntensity: 0.5,
            shininess: 50
        });
        const wristBand = new THREE.Mesh(wristBandGeo, wristBandMaterial);
        wristBand.position.y = -0.58;
        wristBand.rotation.x = Math.PI / 12;
        gloveGroup.add(wristBand);
    }
}

// Carga el archivo del guante como textura de Three.js
export function loadGloveTexture(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        textureLoader.load(e.target.result, (texture) => {
            gloveTexture = texture;
            gloveTexture.minFilter = THREE.LinearFilter;
            rebuildGloveMesh();
        });
    };
    reader.readAsDataURL(file);
}

// Carga la textura directamente desde un DataURL (base64)
export function setGloveTextureFromDataURL(dataURL) {
    if (!dataURL) {
        gloveTexture = null;
        rebuildGloveMesh();
        return;
    }
    textureLoader.load(dataURL, (texture) => {
        gloveTexture = texture;
        gloveTexture.minFilter = THREE.LinearFilter;
        rebuildGloveMesh();
    });
}

// Limpia la textura cargada
export function clearGloveTexture() {
    gloveTexture = null;
    rebuildGloveMesh();
}

// Sincroniza dinámicamente los colores de los materiales 3D con los color pickers del DOM
export function updateColorsFromDOM() {
    if (!scene) return;
    
    const primaryColor = dom.colorPrimary ? dom.colorPrimary.value : '#ff0050';
    const secondaryColor = dom.colorSecondary ? dom.colorSecondary.value : '#00f2fe';

    const pColorNum = parseInt(primaryColor.replace('#', '0x'));
    const sColorNum = parseInt(secondaryColor.replace('#', '0x'));

    // Actualizar Luz de Punto
    if (glowLight) glowLight.color.setHex(pColorNum);

    // Actualizar Material del Guante (Primario)
    if (gloveMaterial) {
        gloveMaterial.color.setHex(pColorNum);
        gloveMaterial.emissive.setHex(pColorNum);
    }

    // Actualizar Material de la Mano (Secundario)
    if (handMaterial) {
        handMaterial.color.setHex(sColorNum);
        handMaterial.emissive.setHex(sColorNum);
    }

    // Actualizar Material de las Partículas (Mezcla de ambos)
    if (particleMaterial) {
        particleMaterial.color.setHex(pColorNum);
    }
}

// Inicia el bucle de renderizado WebGL 3D
export function startThreeAR() {
    if (!renderer || animationFrameId) return;

    // Ajustar el tamaño inicial del lienzo al contenedor
    resizeRenderer();

    // Reiniciar posición rotacional para una entrada suave
    if (mainGroup) {
        mainGroup.rotation.set(0.1, 0, 0);
    }

    const clock = new THREE.Clock();

    function renderLoop() {
        animationFrameId = requestAnimationFrame(renderLoop);
        
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // 1. Rotación lenta y flotación automática del guante (si el usuario no está arrastrando)
        if (!isRotating && mainGroup) {
            mainGroup.rotation.y = Math.sin(time * 0.6) * 0.4;
            mainGroup.position.y = Math.sin(time * 1.8) * 0.08;
        }

        // 2. Latido de escala neón (efecto de poder)
        if (gloveGroup) {
            const scalePulse = 1.0 + Math.abs(Math.sin(time * Math.PI)) * 0.06;
            gloveGroup.scale.set(scalePulse, scalePulse, scalePulse);
        }

        // 3. Animar Partículas Orbitales (Efecto Tornado Espiral)
        if (particlesGroup && particlesGroup.children[0]) {
            const sparks = particlesGroup.children[0];
            const positions = sparks.geometry.attributes.position.array;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                const vel = velocities[i];
                
                // Rotar coordenada en plano XZ
                let x = positions[i * 3];
                let z = positions[i * 3 + 2];
                let y = positions[i * 3 + 1];

                const currentAngle = Math.atan2(z, x);
                const nextAngle = currentAngle + vel.speed * delta;
                
                // Radio orbital con leve oscilación pulsante
                const pulseRadius = vel.initialRadius + Math.sin(time * 2.0 + i) * 0.08;
                
                positions[i * 3] = pulseRadius * Math.cos(nextAngle);
                positions[i * 3 + 2] = pulseRadius * Math.sin(nextAngle);

                // Elevación vertical ascendente con reciclaje
                y += vel.upSpeed * delta;
                if (y > 1.3) {
                    y = -1.2; // Resetear al fondo de la muñeca
                }
                positions[i * 3 + 1] = y;
            }

            sparks.geometry.attributes.position.needsUpdate = true;
            particlesGroup.rotation.y = time * 0.15; // Rotación lenta grupal
        }

        renderer.render(scene, camera);
    }

    renderLoop();
    window.addEventListener('resize', resizeRenderer);
}

// Detiene el bucle de renderizado para ahorrar recursos del GPU
export function stopThreeAR() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    window.removeEventListener('resize', resizeRenderer);
}

// Ajusta el viewport del renderizador cuando cambia el tamaño de la ventana
function resizeRenderer() {
    if (!renderer || !camera || !dom.canvas3DContainer) return;
    const rect = dom.canvas3DContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
}

// Interacción física con el mouse (Rotación interactiva de la mano)
function setupMouseInteraction() {
    if (!dom.canvas3DContainer) return;

    const element = dom.canvas3DContainer;

    const onMouseDown = (e) => {
        isRotating = true;
        previousMousePosition = {
            x: e.clientX || (e.touches && e.touches[0].clientX),
            y: e.clientY || (e.touches && e.touches[0].clientY)
        };
    };

    const onMouseMove = (e) => {
        if (!isRotating || !mainGroup) return;

        const currentX = e.clientX || (e.touches && e.touches[0].clientX);
        const currentY = e.clientY || (e.touches && e.touches[0].clientY);

        const deltaMove = {
            x: currentX - previousMousePosition.x,
            y: currentY - previousMousePosition.y
        };

        // Rotar el modelo según el movimiento arrastrado
        mainGroup.rotation.y += deltaMove.x * 0.007;
        mainGroup.rotation.x += deltaMove.y * 0.007;

        // Limitar rotación vertical para evitar giros imposibles
        mainGroup.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, mainGroup.rotation.x));

        previousMousePosition = {
            x: currentX,
            y: currentY
        };
    };

    const onMouseUp = () => {
        isRotating = false;
    };

    // Eventos de Mouse
    element.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Soporte para pantallas táctiles (Móviles)
    element.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);
}
