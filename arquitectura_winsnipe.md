# 🛡️ Arquitectura y Seguridad de WinSnipe (TikTok Live Studio)

Este documento detalla el diseño de la arquitectura de software y el plan de seguridad ofensiva/defensiva para **WinSnipe**, optimizado para creadores de contenido que transmiten en **TikTok Live Studio**.

---

## 🏗️ 1. Estructura del Sistema (Tech Stack)

### A. Frontend (Next.js 15 App Router & Vercel)
*   **Framework**: Next.js 15 para optimizar el SEO del catálogo, ofrecer carga instantánea de plantillas (React Server Components) y manejar rutas de backend seguras mediante Server Actions y API Routes.
*   **Renderizado**: HTML5 Canvas + Web Animations API para overlays de alto rendimiento y consumo mínimo de CPU (crítico para streamers que juegan en la misma PC).
*   **Despliegue**: Vercel (distribución geográfica global para carga inmediata del widget en TikTok Live Studio).

### B. Backend y Base de Datos (Supabase)
*   **Base de Datos**: PostgreSQL en Supabase gestionando los esquemas JSON de las alertas neón.
*   **Autenticación**: Supabase Auth (inicio de sesión cifrado).
*   **Almacenamiento**: Supabase Storage para alojar las texturas PNG (guantes neón) y spritesheets del AR Asset Factory.

---

## 🔒 2. Plan de Seguridad y Mitigación de Vulnerabilidades

Dado que el widget web se inyectará en **TikTok Live Studio** mediante una **Fuente de Navegador (Browser Source)** basada en Chromium, implementaremos medidas defensivas estrictas para evitar cualquier vulnerabilidad de inyección o secuestro de la PC de transmisión:

### A. Escudo contra Inyección de Código (Anti-XSS en TikTok Live Studio)
*   **Sanitización Absoluta**: Todo campo de texto ingresado por el streamer (títulos, llamados a la acción, marcas) es sanitizado en el servidor mediante **DOMPurify** antes de guardarse en la base de datos.
*   **Prohibición de `innerHTML`**: La inyección dinámica de datos en el lienzo de previsualización se dibuja usando métodos de texto nativos del Canvas 2D (`fillText`) o bindings seguros en React (JSX). Se prohíbe el uso de `dangerouslySetInnerHTML`.
*   **Cabeceras CSP (Content Security Policy)**: Las URLs de los widgets web enviarán cabeceras HTTP de seguridad restrictivas que impiden la ejecución de scripts externos no autorizados dentro de la fuente de navegador de TikTok Live Studio.

### B. Seguridad en Carga de Archivos (Upload Hardening)
*   **Validación de "Magic Bytes"**: El servidor inspeccionará la firma de bits real (magic bytes) de cada archivo subido (avatares, guantes PNG), ignorando la extensión superficial para evitar que se suban scripts ejecutables maliciosos disfrazados de imágenes.
*   **Limitación de Cuota**: Límite estricto de **5 MB** por archivo en el bucket de Supabase Storage.

### C. Row Level Security (RLS) en Base de Datos
*   Cada consulta a PostgreSQL se realiza bajo el contexto de una política RLS estricta. Ningún usuario o agente externo puede alterar, duplicar o leer las plantillas de otro streamer sin una firma de autenticación válida.

### D. Protección contra Abuso de API (Rate Limiting)
*   Implementación de Rate Limiting en las rutas de consulta y exportación mediante Middleware para evitar ataques de fuerza bruta o saturación artificial de renderizado.
