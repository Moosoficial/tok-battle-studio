# Plan de Implementación Maestro: FX Stream Builder (TokBattle Studio)

Este plan integra las nuevas directrices de arquitectura y diseño basadas en el informe maestro **`INFORME_MAESTRO_FX`** obtenido el 2026-05-22.

---

## 🚀 Hoja de Ruta Ampliada (Roadmap)

### Fase 1: Cimientos y Overlays Interactivos (Completado y Sincronizado)
*   **Código Base**: Arquitectura SPA con simulador en tiempo real de Canvas 2D.
*   **Autenticación**: Inicio de sesión simulado mediante `localStorage`.
*   **Sincronización**: Repositorio activo en la rama `main` en [Moosoficial/tok-battle-studio](https://github.com/Moosoficial/tok-battle-studio).

### Fase 2: Editor Avanzado y AR Asset Factory 2D (Siguiente Paso)
*   **Módulo AR (TikTok Effect House)**: Herramienta de compilación de texturas y sistemas de partículas listos para exportar a Effect House.
*   **Línea de Tiempo AR**: Parámetros de fotogramas clave (`Frame Start` / `Frame End`), `tipo_tracking` (ej: `hand_tracker`) y curvas de velocidad.
*   **Editor Visual**: Reemplazo dinámico de los emojis (como 🥊) por imágenes PNG cargadas con físicas orbitales avanzadas.
*   **Tema Dinámico (Claro/Oscuro)**: Sistema de variables CSS unificadas para permitir al streamer alternar instantáneamente entre el modo Cyberpunk oscuro absoluto (#050508) y un modo claro minimalista premium (#faf8ff) según su preferencia estética.

### Fase 3: Previsualizador WebGL 3D y Plantillas Extendidas
*   **Render WebGL (Three.js)**: Lienzo interactivo en 3D para simular el comportamiento de las texturas de los guantes sobre un maniquí virtual con seguimiento (hand/face tracking).
*   **Catálogo**: Integración del esquema JSON extendido que soporta `tiktok_ar_asset`.

---

## 💾 Modelo de Datos Unificado (JSON Schema)

Cada diseño guardado en la plataforma se compilará y guardará bajo este formato de datos estándar para exportación:

```json
{
  "id_efecto": "UUID v4",
  "id_usuario": "UUID v4",
  "nombre": "Nombre de la Plantilla",
  "tipo_efecto": "tap_tap | mvp_alert | tiktok_ar_asset",
  "configuracion_visual": {
    "asset_url": "URL de la textura (.png / .json)",
    "escala_inicial": 0.6,
    "escala_maxima": 1.4,
    "comportamiento_particulas": {
      "tipo_textura": "fire_particle_sprite.png",
      "velocidad_ascenso": 120,
      "dispersion_lateral": 35,
      "opacidad_final": 0.0
    }
  },
  "linea_tiempo_ar": {
    "frame_start": 5,
    "frame_end": 50,
    "fps_objetivo": 60,
    "tipo_tracking": "hand_tracker",
    "curva_velocidad": "ease-out"
  }
}
```

---

## 🛠️ Preguntas Clave para el Equipo

> [!NOTE]
> **1. Enfoque de la Fase 2: ¿Overlays o AR Assets Primero?**
> - ¿Desean que nos enfoquemos en terminar de pulir los overlays interactivos en 2D en pantalla (los temporizadores y tap tap del Canvas) o que prioricemos la exportación y preparación de texturas 2D y partículas para **TikTok Effect House**?
> 
> **2. Simulador AR 3D con Three.js**
> - Para la visualización AR, ¿utilizaremos un modelo 3D estático de una mano/rostro en Three.js para simular el Effect House dentro de la web, o prefieren mantener la previsualización interactiva sobre el canvas 2D en esta versión alfa?
