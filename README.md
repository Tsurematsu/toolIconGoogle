# CLI de Automatización para Google Material Symbols

Esta herramienta de línea de comandos (CLI) está diseñada para automatizar el flujo de trabajo con iconos de **Google Fonts (Material Symbols)** en proyectos de desarrollo web (React, Lit, o Vanilla TS).

Permite buscar, descargar, mapear y reemplazar automáticamente referencias de iconos en tu código fuente, transformando etiquetas `<span>` estáticas en componentes o variables importadas de forma segura.



## 🚀 Características Principales

*   🔍 **Búsqueda Interactiva:** Autocompletado para buscar iconos en la librería de Google.
*   ⬇️ **Descarga Automática:** Descarga los SVGs optimizados localmente.
*   bot **Escaneo de Código (Stitch):** Lee tus archivos `.tsx` o `.ts`, detecta qué iconos estás usando y los descarga automáticamente.
*   🗺️ **Mapeo de Assets:** Genera archivos `index.ts` o `index.tsx` que exportan tus iconos como objetos organizados.
*   💉 **Inyección de Código:** Reemplaza automáticamente los `<span>` de tus archivos por componentes React o directivas Lit.

---

## ¿Como usarlo?

# Primero instalar
```hs
    npm install -g toolicongoogle
```

# En la consola de tu espacio de trabajo ejecutas
```hs
    fontsgo
```

## 📖 Guía de Opciones del Menú

Al iniciar la CLI, verás las siguientes opciones principales:

### 1. 🔍 Buscar icono
Esta opción permite buscar y descargar un icono individual manualmente sin necesidad de tenerlo en el código.
*   Se abrirá un buscador con **autocompletado**.
*   Escribe el nombre (ej: `account_balance`).
*   Al seleccionar, el icono se descargará en tu directorio de assets configurado.

### 2. 🧵 Stitch Google Templates
Es el núcleo de la automatización. Conecta tu código fuente con la librería de iconos.

#### ➤ Extraer iconos
Analiza tu código en busca de referencias a iconos (elementos con la clase `material-symbols-outlined`) y descarga los que falten.
*   **Archivo:** Selecciona un archivo específico `.js`, `.ts`, `.jsx` o `.tsx`.
*   **Recursivo:** Selecciona una carpeta completa. La herramienta escaneará todos los archivos dentro de ella (y subcarpetas) buscando nombres de iconos para descargarlos.

#### ➤ Implementar iconos
Modifica tu código fuente para usar los iconos descargados y mapeados, reemplazando el HTML estático por código dinámico.
*   **File / Directory:** Selecciona el archivo o carpeta destino.
*   **Acción:** Busca estructuras `<span class="material-symbols-outlined">nombre_icono</span>` y las sustituye por:
    *   React: `<assets.nombreIcono />`
    *   Lit: `${() => assets.nombreIcono}`

### 3. 🗺️ Mapear imágenes
Genera un archivo `index.ts` (o `.tsx`) en tu carpeta de descargas que exporta todos los iconos descargados como un objeto estructurado.

*   **For Base (`null`):** Exporta los SVGs como strings simples dentro de un archivo `.ts`. Ideal para Vanilla JS/TS.
*   **For React:** Exporta componentes funcionales de React. Genera un archivo `.tsx` con un helper para inyectar el SVG.
*   **For Lit:** Exporta funciones que retornan `unsafeHTML(svg)`. Genera un archivo `.ts`.

### 4. ⚙️ Config
Configuración global de la herramienta.

*   **Dir descargas:** Define la ruta absoluta donde se guardarán los archivos `.svg` y donde se generará el archivo `index`.
*   **Time icon:** Define el tiempo de espera (en ms) entre descargas para evitar bloqueos por *rate limiting*.
*   **Time search:** Define el tiempo de espera (en ms) para las peticiones de búsqueda.

---

## ⚡ Flujo de Trabajo Recomendado

Para sacar el máximo provecho a la herramienta, sigue este orden:

1.  **Configuración Inicial:**
    *   Ve a `Config` > `Dir descargas` y selecciona tu carpeta `src/assets` (o similar).

2.  **Desarrollo (UI):**
    *   Escribe tu código HTML/JSX normalmente usando los nombres de los iconos:
        ```tsx
        <span className="material-symbols-outlined">rocket_launch</span>
        ```

3.  **Extracción y Descarga:**
    *   Ve a `stitch google templates` > `Extraer iconos` > `Recursivo`.
    *   Selecciona tu carpeta `src`. La CLI encontrará "rocket_launch" y descargará `rocket_launch.svg`.

4.  **Mapeo:**
    *   Ve a `Mapear imágenes` > Selecciona tu framework (ej. `for react`).
    *   Esto creará `src/assets/index.tsx` con el componente listo.

5.  **Inyección:**
    *   Ve a `stitch google templates` > `Implementar iconos`.
    *   Selecciona tu archivo o carpeta.
    *   Tu código cambiará automáticamente a:
        ```tsx
        import assets from "../assets";
        // ...
        <assets.rocketLaunch />
        ```

---

## 🛠️ Tecnologías

*   **Node.js & TypeScript**
*   **Inquirer.js:** Para la interfaz interactiva de terminal.
*   **Google Fonts API:** Fuente de los iconos.

---

## ⚠️ Notas Importantes

*   La herramienta ignora automáticamente la carpeta `node_modules` durante los escaneos recursivos.
*   Asegúrate de ejecutar `Mapear imágenes` antes de `Implementar iconos`, ya que la inyección depende de que exista el objeto `assets` generado.
*   La inyección de iconos verifica si el archivo es `.ts` (Lit) o `.tsx` (React) para aplicar la sintaxis correcta.

# Reconocimentos 
- Kaitovd [https://github.com/Kaitovid] "gracias por probar la herramienta"