/* ==========================================================================
   NANO BANANA STUDIO - LANDING PAGE INTERACTIVE ANIMATIONS
   ========================================================================== */

export function initLandingAnimations() {
    // --- Floating Particles System ---
    const container = document.getElementById('particles-container');
    const heroSection = document.getElementById('hero');
    if (!container || !heroSection) return;

    // Limpiar partículas previas si existían
    container.innerHTML = '';
    const particleCount = 40;
    const particles = [];

    // Generar partículas con propiedades aleatorias
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100; // %
        const y = Math.random() * 100; // %
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * -20;
        const opacity = Math.random() * 0.5 + 0.2;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.opacity = opacity;
        
        // Animación de flotado continuo via CSS
        particle.style.animation = `blob ${duration}s ease-in-out ${delay}s infinite alternate`;
        
        container.appendChild(particle);
        particles.push({
            el: particle,
            baseX: x,
            baseY: y,
            depth: (i % 5) + 1
        });
    }

    // Interacción interactiva del ratón (Efecto Parallax Reactivo)
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        // Normalizar posición del cursor entre -1 y 1 respecto al centro
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        isHovering = true;
    });

    heroSection.addEventListener('mouseleave', () => {
        isHovering = false;
    });

    // Bucle de animación suave
    function animateParticles() {
        if (isHovering) {
            particles.forEach((p) => {
                const offsetX = mouseX * p.depth * -12; 
                const offsetY = mouseY * p.depth * -12;
                p.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
        } else {
             particles.forEach(p => {
                p.el.style.transform = `translate(0px, 0px)`;
            });
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    // --- Intersection Observer para efectos de Scroll Reveal ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Revelar solo una vez
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Disparar cuando esté al menos 10% visible
        rootMargin: "0px 0px -50px 0px" 
    });

    revealElements.forEach(el => revealObserver.observe(el));
}
