import fs from 'fs/promises';
import path from 'path';

// ----------------------------------------------------------------------
// CONFIGURACIÓN
// ----------------------------------------------------------------------

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.svg', 
  '.webp', '.avif', '.ico', '.bmp', '.tiff'
]);

interface ImageMap {
  [key: string]: string | ImageMap;
}

// ----------------------------------------------------------------------
// FUNCIONES AUXILIARES
// ----------------------------------------------------------------------

/**
 * Sanitiza el nombre para usarlo como key válida en un objeto JS.
 * Ej: "mi imagen (1)" => "mi_imagen_1"
 */
function sanitizeKey(fileName: string): string {
  // Reemplazar caracteres no alfanuméricos por guión bajo
  let cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
  // Eliminar guiones bajos repetidos
  cleanName = cleanName.replace(/_+/g, '_');
  // Eliminar guiones bajos al inicio o final
  cleanName = cleanName.replace(/^_|_$/g, '');
  // Si empieza con número, agregar guión bajo al inicio
  if (/^\d/.test(cleanName)) {
    cleanName = `_${cleanName}`;
  }
  return cleanName || 'unnamed_resource';
}

/**
 * Escanea recursivamente y genera las rutas WEB.
 * 
 * @param currentDir Directorio actual siendo escaneado (Ruta sistema)
 * @param rootPublicDir La ruta base de 'public' para calcular la relativa
 */
async function scanDirectory(currentDir: string, rootPublicDir: string): Promise<ImageMap> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const directoryMap: ImageMap = {};

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      // Recursividad: pasamos el rootPublicDir hacia abajo
      const subDirMap = await scanDirectory(fullPath, rootPublicDir);

      if (Object.keys(subDirMap).length > 0) {
        const dirKey = sanitizeKey(entry.name);
        directoryMap[dirKey] = subDirMap;
      }

    } else if (entry.isFile()) {
      const { name, ext } = path.parse(entry.name);

      if (IMAGE_EXTENSIONS.has(ext.toLowerCase())) {
        const imageKey = sanitizeKey(name);

        if (directoryMap[imageKey]) {
          console.warn(`⚠️ [ImageMapper] Key duplicada simplificada: "${imageKey}". Se sobrescribirá.`);
        }

        // ---------------------------------------------------------
        // LÓGICA DE RUTA DE SERVIDOR (WEB PATH)
        // ---------------------------------------------------------
        
        // 1. Obtenemos la ruta relativa desde 'public' (ej: "assets\img\foto.png")
        const relativePath = path.relative(rootPublicDir, fullPath);

        // 2. Normalizamos los separadores para web.
        // Windows usa '\', la web usa '/'. Esto asegura compatibilidad cruzada.
        const webPath = '/' + relativePath.split(path.sep).join('/');

        // Asignamos la ruta web ("/assets/img/foto.png")
        directoryMap[imageKey] = webPath;
      }
    }
  }

  return directoryMap;
}

// ----------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ----------------------------------------------------------------------

export async function generateImageMap(baseDir: string, outputFilename: string, extencion = "ts"): Promise<void> {
  try {
    const publicDir = path.join(baseDir, 'public');
    const assetsDir = path.join(baseDir, 'src', 'assets');
    const outputFile = path.join(assetsDir, `${outputFilename}.${extencion}`);

    // Validar existencia de public
    try {
      await fs.access(publicDir);
    } catch {
      throw new Error(`❌ No se encontró la carpeta 'public' en: ${publicDir}`);
    }

    console.log(`🔍 Escaneando carpeta 'public': ${publicDir}`);

    // Pasamos publicDir dos veces: una como directorio actual, otra como raíz para calcular relativas
    const imageTree = await scanDirectory(publicDir, publicDir);

    const fileContent = `/* eslint-disable */
// ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE
// Las rutas son absolutas respecto al servidor (comienzan con /)

const ${outputFilename} = ${JSON.stringify(imageTree, null, 2)};
export default ${outputFilename}
`;

    await fs.mkdir(assetsDir, { recursive: true });
    await fs.writeFile(outputFile, fileContent, 'utf-8');

    console.log(`✅ Mapa de imágenes generado en: ${outputFile}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}