import fs from "fs";
import path from "path";

// --- UTILIDADES ---

/**
 * Convierte string a camelCase (Misma lógica que el generador de índices)
 */
function toCamelCase(str: string): string {
  return str
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+(\w)/g, (_, c) => c.toUpperCase())
    .replace(/\s/g, "")
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

/**
 * Escanea recursivamente la carpeta de assets para crear un mapa de rutas.
 * @param dir Directorio actual de assets
 * @param prefix Prefijo para la notación de punto (ej: "actions.")
 */
function buildIconMap(dir: string, prefix: string = ""): Record<string, string> {
  const map: Record<string, string> = {};
  
  // Validación de seguridad por si la carpeta assets no existe
  if (!fs.existsSync(dir)) return map;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const ext = path.extname(entry.name).toLowerCase();
    const baseName = path.basename(entry.name, ext);
    const camelName = toCamelCase(baseName);
    
    if (entry.isDirectory()) {
      const subMap = buildIconMap(path.join(dir, entry.name), `${prefix}${camelName}.`);
      Object.assign(map, subMap);
    } else if (ext === ".svg") {
      map[baseName.toLowerCase()] = `${prefix}${camelName}`;
      map[camelName.toLowerCase()] = `${prefix}${camelName}`;
    }
  }
  return map;
}

// --- LÓGICA PRINCIPAL ---

/**
 * Función principal para reemplazar iconos.
 * @param assetsRootDir Ruta absoluta de la carpeta raíz donde se generó el index.ts (assets)
 * @param targetFilePath Ruta absoluta del archivo .ts o .tsx a modificar
 */
export default function InjectIcons(assetsRootDir: string, targetFilePath: string): void {
  // 1. Validaciones básicas de existencia
  if (!fs.existsSync(assetsRootDir) || !fs.existsSync(targetFilePath)) {
    // Se puede silenciar el error si se prefiere
    console.error("❌ Error: Ruta de assets o archivo destino no encontrada.");
    return;
  }

  // 2. Determinar Framework
  const ext = path.extname(targetFilePath);
  let framework: "react" | "lit" | null = null;

  if (ext === ".tsx") framework = "react";
  else if (ext === ".ts") framework = "lit";
  else return; // Ignorar otros archivos

  // 3. Leer contenido del archivo
  let content = fs.readFileSync(targetFilePath, "utf-8");

  // =========================================================
  // 4. NUEVA VALIDACIÓN: Optimización por contenido (Early Exit)
  // =========================================================
  
  // A) Verificar si tiene estructura HTML/JSX o Templates de Lit
  // Regex busca:
  // - <[a-zA-Z]  -> Inicio de etiqueta (ej: <div, <span, <MyComp)
  // - html`      -> Template literal de Lit
  // - svg`       -> Template literal de Lit
  const hasHtmlStructure = /<[a-zA-Z]|html`|svg`/.test(content);
  
  if (!hasHtmlStructure) {
    // Es un archivo de pura lógica (utils, services, hooks sin JSX), no hacemos nada.
    return;
  }

  // B) Verificar si contiene específicamente la clase que queremos reemplazar
  // Si tiene HTML pero no tiene "material-symbols-outlined", no vale la pena seguir.
  if (!content.includes("material-symbols-outlined")) {
    return;
  }

  // =========================================================
  // Si llegamos aquí, el archivo es candidato válido.
  // Procedemos con la carga pesada (leer assets y reemplazar).
  // =========================================================

  // 5. Construir el mapa de iconos (Solo ahora, para ahorrar recursos)
  const iconMap = buildIconMap(assetsRootDir);

  // 6. Regex para encontrar los spans
  const regex = /<span\s+([^>]*?)\b(?:class|className)=["'][^"']*?\bmaterial-symbols-outlined\b[^"']*?["']([^>]*?)>\s*([a-zA-Z0-9_]+)\s*<\/span>/g;

  let hasReplacements = false;

  // 7. Ejecutar reemplazo
  const newContent = content.replace(regex, (match, attrsBefore, attrsAfter, iconName) => {
    const normalizedIconName = iconName.trim();
    const mappedPath = iconMap[normalizedIconName.toLowerCase()] || iconMap[toCamelCase(normalizedIconName).toLowerCase()];

    if (!mappedPath) {
      console.warn(`⚠️ Icono no encontrado en assets: "${iconName}". Se deja intacto.`);
      return match;
    }

    hasReplacements = true;
    const fullAccessor = `assets.${mappedPath}`;

    if (framework === "react") {
      // React: <assets.ruta.icono />
      return `<${fullAccessor} />`;
    } 
    
    if (framework === "lit") {
      // Lit: ${() => assets.ruta.icono}
      return `\${() => ${fullAccessor}}`;
    }

    return match;
  });

  if (!hasReplacements) return;

  // 8. Inyectar Import
  const targetDir = path.dirname(targetFilePath);
  let relativePath = path.relative(targetDir, assetsRootDir);
  relativePath = relativePath.split(path.sep).join("/"); // Fix Windows paths
  if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;

  const importStatement = `import assets from "${relativePath}";`;

  if (!newContent.includes(`from "${relativePath}"`) && !newContent.includes(`from '${relativePath}'`)) {
    content = `${importStatement}\n${newContent}`;
  } else {
    content = newContent;
  }

  // 9. Guardar cambios
  fs.writeFileSync(targetFilePath, content, "utf-8");
  // console.log(`✅ Archivo modificado: ${path.basename(targetFilePath)}`);
}