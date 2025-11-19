import fs from "fs";
import path from "path";

export type Framework = "react" | "lit";

/** 
 * Convierte nombres de archivo a formato camelCase 
 */
function toCamelCase(str: string): string {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/\s+(\w)/g, (_, c) => c.toUpperCase())
    .replace(/\s/g, "")
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

/** 
 * Lee un archivo SVG, reemplaza fill="..." por fill="currentColor"
 * y retorna el contenido como string.
 */
function normalizeSvgFill(filePath: string): string | null {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    
    // Reemplazar fills existentes por currentColor
    content = content.replace(/fill="[^"]*"/gi, 'fill="currentColor"');
    
    // Si no tiene fill, inyectarlo en la etiqueta svg
    if (!/fill="/i.test(content)) {
      content = content.replace(/<svg\b([^>]*)>/i, '<svg$1 fill="currentColor">');
    }

    return content;
  } catch (err: any) {
    console.warn(`⚠️ Error procesando SVG: ${filePath}`, err.message);
    return null;
  }
}

/** 
 * Genera recursivamente archivos index.ts / index.tsx dentro de un directorio
 */
function generateIndexForDir(dir: string, framework: Framework): void {
  // Obtenemos archivos y carpetas
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const importLines: string[] = [];
  const objectEntries: string[] = [];

  // Lista de extensiones de imagen permitidas (excluyendo SVG que se trata especial)
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".avif"];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    const baseName = path.basename(entry.name, ext);
    const camelName = toCamelCase(baseName);

    // Caso 1: Es un directorio
    if (entry.isDirectory()) {
      generateIndexForDir(fullPath, framework); // Recursión pasando el framework
      
      // Importamos el index del subdirectorio
      importLines.push(`import ${camelName} from "./${entry.name}";`);
      objectEntries.push(`  ${camelName},`);
    } 
    // Caso 2: Es un archivo
    else {
      if (ext === ".svg") {
        // Para SVG: leer contenido, normalizar y exportar
        const svgContent = normalizeSvgFill(fullPath);
        if (svgContent) {
          // Escapar caracteres conflictivos para template literals
          const escapedContent = svgContent
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');

          // Guardamos el string crudo en una constante local para no ensuciar el objeto
          const rawVarName = `${camelName}_raw`;
          importLines.push(`const ${rawVarName} = \`${escapedContent}\`;`);

          // Lógica según el framework
          if (framework === "react") {
             // React: usa la función helper createSvgComponent
             objectEntries.push(`  ${camelName}: createSvgComponent(${rawVarName}),`);
          } else {
             // Lit: usa una arrow function con unsafeHTML
             objectEntries.push(`  ${camelName}: () => unsafeHTML(${rawVarName}),`);
          }
        }
      } else if (imageExtensions.includes(ext)) {
        // Para otras imágenes: generar import estándar
        const relPath = `./${entry.name}`;
        importLines.push(`import ${camelName} from "${relPath}";`);
        objectEntries.push(`  ${camelName},`);
      }
    }
  }

  // Definir cabeceras y helpers según framework
  let header = "";
  let outputFileName = "index.ts";

  if (framework === "react") {
    outputFileName = "index.tsx"; // Usamos tsx porque incluye JSX
    header = `import React from 'react';

// Helper para crear componentes SVG en React
export function createSvgComponent(svgString: string) {
  return function SvgComponent(props: any) {
    return (
      <span
        {...props}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    );
  };
}`;
  } else {
    // Lit
    header = `import { unsafeHTML } from 'lit/directives/unsafe-html.js';`;
  }

  // Construir el contenido final del archivo
  const content = `${header}

${importLines.join("\n")}

export default {
${objectEntries.join("\n")}
};
`;

  // Escribir el archivo (index.ts o index.tsx)
  fs.writeFileSync(path.join(dir, outputFileName), content);
}

/**
 * Función principal exportada por defecto.
 * Recibe una ruta absoluta y genera índices recursivos para assets.
 * @param rootFolder Ruta absoluta del directorio a procesar.
 * @param framework El framework destino ('react' | 'lit').
 */
export default function MapImage(rootFolder: string, framework: Framework): void {
  if (!fs.existsSync(rootFolder)) {
    throw new Error(`La carpeta no existe: ${rootFolder}`);
  }
  
  if (!fs.lstatSync(rootFolder).isDirectory()) {
    throw new Error(`La ruta proporcionada no es un directorio: ${rootFolder}`);
  }

  generateIndexForDir(rootFolder, framework);
}