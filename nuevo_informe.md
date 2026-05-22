# INFORME MAESTRO DE ARQUITECTURA Y DISEÑO: FX STREAM BUILDER

> **Fuente:** Google Drive — `INFORME_MAESTRO_FX`
> **Modificado:** 2026-05-22 | **Creado:** 2026-05-22

---

## 1. VISION GENERAL DEL SAAS

FX Stream Builder es una plataforma de software como servicio (SaaS) diseñada para revolucionar la estética de las batallas y transmisiones en TikTok Live. Funciona exclusivamente como un entorno de autoría y diseño (estilo Canva o Figma) donde los creadores configuran sus recursos visuales sin interactuar con transmisiones en vivo ni APIs externas.

El sistema se divide en dos grandes vertientes de diseño:

1. **Overlays de Pantalla (2D Interactivos):** Efectos basados en parámetros de fotogramas clave (`Frame Start` / `Frame End`) para mecánicas de "TAP TAP" y alertas MVP.

2. **AR Asset Factory (Realidad Aumentada):** Un estudio de diseño web para compilar texturas y sistemas de partículas optimizados para su importación directa en **TikTok Effect House** (ej. Guantes de boxeo con llamas azules de seguimiento manual).

---

## 2. STACK TECNOLOGICO PRINCIPAL

- **Frontend UI & Renders:** Next.js 15 (App Router), Tailwind CSS y Framer Motion.
- **Motor de Animación Web:** HTML5 Canvas, Web Animations API y `lottie-web` para vectoriales.
- **Entorno de Previsualización AR (Fase 3):** WebGL (Three.js) para simular el comportamiento de los guantes 3D/2D sobre un maniquí de tracking.
- **Infraestructura Backend:** Supabase para Autenticación, PostgreSQL para esquemas relacionales y Supabase Storage para el alojamiento de texturas, spritesheets y configuraciones JSON.

---

## 3. MODELO DE DATOS EXTENDIDO (JSON SCHEMA)

Las configuraciones guardadas por los usuarios se gestionan bajo este esquema unificado en la base de datos:

```json
{
  "id_efecto": "UUID v4",
  "id_usuario": "UUID v4",
  "nombre": "Guante de Fuego Azul Metálico",
  "tipo_efecto": "tap_tap | mvp_alert | tiktok_ar_asset",
  "configuracion_visual": {
    "asset_url": "https://tu-storage.supabase.co/storage/v1/object/public/assets/glove_blue.png",
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
