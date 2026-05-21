# Plan de Implementación: FX Stream Builder (TokBattle Studio)

Este documento detalla el plan de desarrollo y diseño técnico para avanzar con las fases del proyecto **FX Stream Builder** (TokBattle Studio) para el equipo de desarrollo.

---

## 🚀 Hoja de Ruta (Roadmap)

### Fase 1: Cimientos y Landing Page Interactiva (Listo y Sincronizado)
*   **Código Base**: Arquitectura SPA cliente en HTML5, CSS y JS con un visualizador interactivo de Canvas en tiempo real.
*   **Autenticación**: Sistema simulado de alta fidelidad basado en `localStorage`.
*   **Control de Versiones**: Sincronizado en la rama `main` de GitHub.

### Fase 2: El Motor del Editor Visual (El Lienzo)
*   **Línea de Tiempo**: Agregar controles deslizantes (`Frame Start` y `Frame End`) para ajustar la duración exacta de las animaciones.
*   **Carga de Recursos (Uploader)**: Permitir la subida de imágenes PNG personalizadas para reemplazar el emoji del guante 🥊 con físicas de rotación y escala dinámicas en el Canvas.

### Fase 3: Catálogo y Sistema de Plantillas
*   **Persistencia**: Diseñar el guardado de efectos personalizados en JSON.
*   **Acciones del Dashboard**: Opciones para **Editar** (cargar de nuevo en el lienzo), **Duplicar** (crear variantes) y **Borrar** plantillas del panel principal.

---

## 🛠️ Preguntas de Diseño Abiertas

> [!NOTE]
> **1. Integración de Base de Datos (Supabase vs. LocalStorage)**
> - ¿Implementamos una base de datos real con Supabase en la nube para persistencia de plantillas o refinamos la base local de `localStorage` para pruebas rápidas sin configuraciones externas?
> 
> **2. Renderizado Visual (Partículas Canvas vs. Lottie)**
> - ¿Continuamos extendiendo el motor físico de partículas y chispas neón nativo del Canvas 2D, o preferimos integrar `lottie-web` para animaciones vectoriales basadas en JSON?
