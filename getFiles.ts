import { readdir } from 'fs/promises';
import { resolve } from 'path';

/**
 * Recorre recursivamente un directorio y retorna las rutas absolutas
 * de todos los archivos que coincidan con las extensiones de JavaScript/TypeScript.
 * 
 * @param dirPath - La ruta del directorio a escanear.
 * @returns Promesa con un array de strings (rutas absolutas).
 */
export async function getSourceFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  
  // Regex para capturar .js, .ts, .jsx, .tsx
  // Expliación: \. (punto) + (t|j) (t o j) + s + x? (x opcional) + $ (fin de linea)
  const validExtensions = /\.(t|j)sx?$/;

  try {
    // Leemos el directorio obteniendo objetos 'Dirent' para saber si son carpetas o archivos
    const dirents = await readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
      const res = resolve(dirPath, dirent.name);

      // Importante: Ignorar node_modules y carpetas ocultas (como .git) para evitar bucles infinitos o lentitud
      if (dirent.isDirectory()) {
        if (dirent.name !== 'node_modules' && !dirent.name.startsWith('.')) {
          const nestedFiles = await getSourceFiles(res);
          files.push(...nestedFiles);
        }
      } else {
        // Si es archivo, verificamos la extensión
        if (validExtensions.test(dirent.name)) {
          files.push(res);
        }
      }
    }
  } catch (error) {
    console.error(`Error leyendo el directorio ${dirPath}:`, error);
  }

  return files;
}