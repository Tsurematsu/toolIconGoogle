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
 */
function buildIconMap(dir: string, prefix: string = ""): Record<string, string> {
  const map: Record<string, string> = {};
  
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
 * Función principal para reemplazar iconos conservando propiedades.
 */
export default function InjectIcons(assetsRootDir: string, targetFilePath: string): void {
  // 1. Validaciones básicas
  if (!fs.existsSync(assetsRootDir) || !fs.existsSync(targetFilePath)) {
    console.error("❌ Error: Ruta de assets o archivo destino no encontrada.");
    return;
  }

  // 2. Determinar Framework
  const ext = path.extname(targetFilePath);
  let framework: "react" | "lit" | null = null;

  if (ext === ".tsx") framework = "react";
  else if (ext === ".ts") framework = "lit";
  else return;

  // 3. Leer contenido
  let content = fs.readFileSync(targetFilePath, "utf-8");

  // 4. Validación rápida (Early Exit)
  const hasHtmlStructure = /<[a-zA-Z]|html`|svg`/.test(content);
  if (!hasHtmlStructure) return;
  if (!content.includes("material-symbols-outlined")) return;

  // 5. Construir mapa de iconos
  const iconMap = buildIconMap(assetsRootDir);

  // 6. Regex mejorada: Captura TODOS los atributos dentro del span
  // Grupo 1: Todo el string de atributos (ej: ' className="text-red" style={{...}}')
  // Grupo 2: El nombre del icono
  const regex = /<span(\s+[^>]*?)>\s*([a-zA-Z0-9_]+)\s*<\/span>/g;

  let hasReplacements = false;

  // 7. Ejecutar reemplazo
  const newContent = content.replace(regex, (match, rawAttributes, iconName) => {
    // A. Verificar si es el span correcto
    if (!rawAttributes.includes("material-symbols-outlined")) {
      return match; // No es un icono de material, lo ignoramos
    }

    // B. Validar existencia del icono
    const normalizedIconName = iconName.trim();
    const mappedPath = iconMap[normalizedIconName.toLowerCase()] || iconMap[toCamelCase(normalizedIconName).toLowerCase()];

    if (!mappedPath) {
      console.warn(`⚠️ Icono no encontrado en assets: "${iconName}". Se deja intacto.`);
      return match;
    }

    hasReplacements = true;

    // C. Limpiar atributos: eliminar solo 'material-symbols-outlined'
    let cleanedAttrs = rawAttributes.replace(
      /\b(class|className)=(["'])([\s\S]*?)\2/g, // Busca class="..." o className="..."
      (fullAttr: string, attrName: string, quote: string, value: string) => {
        // Eliminar la clase específica
        let newValue = value.replace(/\bmaterial-symbols-outlined\b/g, "").trim();
        // Limpiar espacios dobles
        newValue = newValue.replace(/\s+/g, " ");

        // Si se quedó vacío (ej: className="material-symbols-outlined"), eliminamos el atributo entero
        if (!newValue) return "";
        
        // Si es Lit, aseguramos usar 'class' en lugar de 'className'
        const finalAttrName = (framework === "lit" && attrName === "className") ? "class" : attrName;
        
        return `${finalAttrName}=${quote}${newValue}${quote}`;
      }
    );

    // Limpiar espacios extra generados por la eliminación de atributos
    cleanedAttrs = cleanedAttrs.replace(/\s+/g, " ").trim();

    // NOTA: Si requieres que sea 'assets.svg.path', cambia la línea de abajo a `assets.svg.${mappedPath}`
    const fullAccessor = `assets.${mappedPath}`;

    // D. Retornar estructura según framework
    if (framework === "react") {
      // React: <assets.accountBalance className="..." />
      // Si hay atributos, agregamos espacio, si no, se cierra directo.
      return `<${fullAccessor}${cleanedAttrs ? " " + cleanedAttrs : ""} />`;
    } 
    
    if (framework === "lit") {
      // Lit: ${assets.accountBalance('class="..."')}
      // Pasamos los atributos limpios como string a la función
      return `\${${fullAccessor}('${cleanedAttrs}')}`;
    }

    return match;
  });

  if (!hasReplacements) return;

  // 8. Inyectar Import
  const targetDir = path.dirname(targetFilePath);
  let relativePath = path.relative(targetDir, assetsRootDir);
  relativePath = relativePath.split(path.sep).join("/");
  if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;

  const importStatement = `import assets from "${relativePath}";`;

  if (!newContent.includes(`from "${relativePath}"`) && !newContent.includes(`from '${relativePath}'`)) {
    content = `${importStatement}\n${newContent}`;
  } else {
    content = newContent;
  }

  // 9. Guardar cambios
  fs.writeFileSync(targetFilePath, content, "utf-8");
}