# ⚡ WinSnipe (TokBattle Studio) 🥊

**WinSnipe** es una plataforma de software como servicio (SaaS) premium diseñada para revolucionar las batallas y transmisiones de TikTok Live con Overlays 2D Interactivos y Realidad Aumentada (AR).

---

## 🗺️ Guía Rápida para Desarrolladores y Agentes

Si eres un desarrollador, diseñador o agente de IA que acaba de unirse al proyecto, este es tu punto de partida. Por favor, lee los siguientes documentos maestros para comprender el alcance:

1. 📘 **[informe_tecnico.md](file:///c:/Users/Oswaldo/.gemini/antigravity/scratch/tok-battle-studio/informe_tecnico.md)**: El informe inicial con las mecánicas del editor Canvas, la exportación de video transparente (WebM), la Landing Page interactiva y el Roadmap original.
2. 📙 **[nuevo_informe.md](file:///c:/Users/Oswaldo/.gemini/antigravity/scratch/tok-battle-studio/nuevo_informe.md)**: El **Informe de Arquitectura Maestro** que añade el soporte de realidad aumentada para **TikTok Effect House** (AR Asset Factory) y el previsualizador 3D interactivo en WebGL con **Three.js**.
3. 📝 **[plan_de_implementacion.md](file:///c:/Users/Oswaldo/.gemini/antigravity/scratch/tok-battle-studio/plan_de_implementacion.md)**: La guía de desarrollo paso a paso y el esquema JSON de la base de datos unificada para persistencia de plantillas.

---

## 🛠️ Estructura de la Aplicación

La aplicación está estructurada actualmente como una SPA de alto rendimiento con estética neón (Cyberpunk) interactiva:

*   `index.html`: La interfaz unificada (Landing Page, Dashboard de Plantillas, Estudio de Edición con Simulador de Teléfono, Modal de Guía de OBS).
*   `app.js`: Script principal de arranque y ruteador SPA.
*   `js/`:
    *   `canvas.js`: El motor gráfico del simulador 2D en HTML5 Canvas con partículas neón, control de tiempos de reproducción y grabador de video en WebM (MediaRecorder).
    *   `simulator.js`: El simulador de batallas en vivo de TikTok (comentarios dinámicos flotantes y barra de puntuación interactiva).
    *   `auth.js` & `state.js`: Gestión del estado global y autenticación basada en `localStorage`.
*   `css/`: Estilos modulares organizados por secciones para una interfaz fluida y moderna con efectos de resplandor neón.

---

## 🤝 Cómo Colaborar

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Moosoficial/tok-battle-studio.git
   ```
2. **Consultar el Plan de Tareas**: Lee las preguntas y decisiones abiertas en `plan_de_implementacion.md` para coordinar el desarrollo de la Fase 2 y 3.
