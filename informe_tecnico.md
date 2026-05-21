# INFORME TÉCNICO Y PLAN DE PROYECTO: FX STREAM BUILDER

## 1. VISIÓN GENERAL DEL PRODUCTO

FX Stream Builder es una plataforma de software como servicio (SaaS) orientada al diseño y autoría de efectos visuales interactivos para creadores de contenido, enfocada exclusivamente en el nicho de "Batallas Live" de TikTok.

A diferencia de las herramientas de edición de video tradicionales, esta plataforma funciona como un entorno de configuración visual (estilo Canva o Figma) donde el usuario personaliza comportamientos, mecánicas de partículas ("TAP TAP") y alertas de MVP sin renderizar archivos de video pesados. El producto final se exporta como una configuración de datos ligera (JSON) optimizada para el renderizado en tiempo real en el navegador.

La plataforma se desvincula por completo de la transmisión en vivo del usuario, de la captura de eventos en tiempo real o de cualquier API externa de streaming. Es, estrictamente, una herramienta de diseño y exportación de plantillas.

---

## 2. STACK TECNOLÓGICO

### Frontend (Entorno de Diseño y UI)

*   **Framework:** Next.js 15 (App Router) con soporte de React Server Components para optimizar el rendimiento del catálogo.
*   **Estilos:** Tailwind CSS para un diseño ágil, moderno y adaptable en modo oscuro.
*   **Animación de Interfaz:** Framer Motion para las transiciones suaves dentro del panel de control y el editor.

### Motor de Animación (El Lienzo / Canvas)

*   **Renderizado de Fotogramas:** Web Animations API y HTML5 Canvas para el control nativo de partículas con alto rendimiento.
*   **Animación Vectorial:** Lottie-web (Airbnb) para permitir la importación y segmentación exacta de animaciones (`Frame Start` y `Frame End`) sin pérdida de calidad.

### Backend e Infraestructura

*   **Base de Datos:** Supabase (PostgreSQL) para gestionar los usuarios y almacenar los esquemas JSON de las configuraciones de los efectos.
*   **Autenticación:** Supabase Auth (Inicio de sesión con correo y redes sociales).
*   **Almacenamiento (Storage):** Supabase Storage para guardar los recursos gráficos (PNGs de guantes, tiras de sprites o archivos JSON de Lottie) que suban los creadores.

---

## 3. MODELO DE DATOS NÚCLEO (ESQUEMA JSON)

Cada efecto diseñado por un usuario se almacena en la base de datos como un objeto JSON estructurado bajo la siguiente lógica:

```json
{
  "id_efecto": "string (UUID)",
  "id_usuario": "string (UUID)",
  "nombre": "string",
  "tipo_efecto": "tap_tap | mvp_alert | custom_sprite",
  "configuracion_visual": {
    "asset_url": "string (URL de Supabase Storage)",
    "escala": {
      "inicial": "float",
      "maxima": "float"
    },
    "comportamiento_fisico": {
      "velocidad_ascenso": "int",
      "dispersion_lateral": "int",
      "opacidad_final": "float"
    }
  },
  "linea_tiempo": {
    "frame_start": "int",
    "frame_end": "int",
    "fps_objetivo": "int (ej. 30 o 60)",
    "curva_velocidad": "string (linear | ease-out | cubic-bezier)"
  }
}
```

---

## 4. PLAN DE IMPLEMENTACIÓN (ROADMAP DE DESARROLLO)

### Fase 1: Cimientos y Landing Page Interactiva

*   **Objetivo:** Capturar el interés de los streamers mediante un gancho visual inmediato y configurar la estructura base.
*   **Entregables:**
    *   Configuración del repositorio de Next.js 15.
    *   Desarrollo de la Landing Page con el componente "Hero Interactive Simulator" (Simulador de TAP TAP con físicas básicas de clic).
    *   Vinculación inicial con Supabase para la creación de cuentas de usuario.

### Fase 2: El Motor del Editor Visual (El Lienzo)

*   **Objetivo:** Construir la interfaz de diseño donde ocurre la magia de la personalización.
*   **Entregables:**
    *   Lienzo de previsualización que simula la pantalla de un teléfono.
    *   Controles deslizantes (Sliders) para modificar de forma dinámica el `Frame Start` y `Frame End` de una animación.
    *   Módulo de carga de archivos (Uploader) para que el usuario suba sus propios diseños de guantes.

### Fase 3: Catálogo y Sistema de Plantillas

*   **Objetivo:** Ofrecer una experiencia ágil con configuraciones preestablecidas listos para modificar.
*   **Entregables:**
    *   Base de datos poblada con 5 plantillas por defecto (Fuego, Destello Cósmico, Impacto de Boxeo).
    *   Panel de control (Dashboard) donde el usuario puede ver, duplicar, editar o borrar sus efectos guardados.

### Fase 4: Optimización, Pruebas y Despliegue

*   **Objetivo:** Asegurar que las animaciones consuman el mínimo de recursos en el navegador y lanzar la web al público.
*   **Entregables:**
    *   Pruebas de rendimiento del Canvas (limpieza de memoria al destruir partículas).
    *   Despliegue de la aplicación frontend en Vercel.
    *   Lanzamiento oficial de la fase Beta del SaaS.
