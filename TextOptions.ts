const TextOptionsSpanish = {
    "Buscar icono:": "Buscar icono",
    "Stitch Google templates": "Stitch Google templates",
    "Mapear imágenes": "Mapear imágenes",
    "Config": "Config",
    "Salir": "Salir",

    // MapearImágenes submenu
    "For base": "For base",
    "For react": "For react",
    "For static (vite ts)": "For static (vite ts)",
    "For static (vite js)": "For static (vite js)",
    "For lit": "For lit",
    "Volver": "Volver",

    // RemplaceToSvg submenu
    "Archivo": "Archivo",
    "Directorio": "Directorio",

    // Config submenu
    "Dir descargas": "Dir descargas",
    "Time icon": "Time icon",
    "Time search": "Time search",

    // stitch_with_google_templates submenu
    "Extraer iconos": "Extraer iconos",
    "Implementar iconos": "Implementar iconos",
    "Recursivo": "Recursivo",
};


const TextOptionsEnglish = {
    "Buscar icono:": "Search icon",
    "Stitch Google templates": "Stitch Google templates",
    "Mapear imágenes": "Map images",
    "Config": "Config",
    "Salir": "Exit",

    // MapearImágenes submenu
    "For base": "For base",
    "For react": "For react",
    "For static (vite ts)": "For static (vite ts)",
    "For static (vite js)": "For static (vite js)",
    "For lit": "For lit",
    "Volver": "Back",

    // RemplaceToSvg submenu
    "Archivo": "File",
    "Directorio": "Directory",

    // Config submenu
    "Dir descargas": "Downloads directory",
    "Time icon": "Icon time",
    "Time search": "Search time",

    // stitch_with_google_templates submenu
    "Extraer iconos": "Extract icons",
    "Implementar iconos": "Implement icons",
    "Recursivo": "Recursive",
};


function getSystemLanguage() {
    const lang =
        process.env.LC_ALL ||
        process.env.LC_MESSAGES ||
        process.env.LANG ||
        process.env.LANGUAGE;

    if (!lang) return "en"; // fallback

    // LANG suele venir como: es_ES.UTF-8 → extraemos "es"
    return lang.split(/[._]/)[0];
}

export {TextOptionsSpanish, TextOptionsEnglish, getSystemLanguage};
