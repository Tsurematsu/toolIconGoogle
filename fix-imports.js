import fs from 'fs/promises';
import path from 'path';

// --- CONFIGURACIÓN ---
const DIST_DIR = './dist';
const ROOT_DIR = '.';

// Archivos de la raíz que ignoramos
const IGNORE_FILES = [
    'fix-imports.js',
    'jest.config.js',
    'vite.config.js',
    'eslint.config.js',
    'prettier.config.js',
    'commitlint.config.js',
    'tsconfig.json',
    'package.json',
    'package-lock.json'
];

// El código que inyectaremos para definir __dirname
const DIRNAME_SHIM = `
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirnamePath } from 'path';
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnamePath(__filename);
`;

/**
 * 1. Copia los JS "sueltos" de la raíz a dist
 */
async function copyRootJsFiles() {
    const items = await fs.readdir(ROOT_DIR, { withFileTypes: true });
    let copiedCount = 0;

    for (const item of items) {
        if (item.isFile() && item.name.endsWith('.js')) {
            if (IGNORE_FILES.includes(item.name)) continue;

            const srcPath = path.join(ROOT_DIR, item.name);
            const destPath = path.join(DIST_DIR, item.name);

            await fs.copyFile(srcPath, destPath);
            copiedCount++;
        }
    }
    if (copiedCount > 0) console.log(`   📋 Copiados ${copiedCount} scripts raíz -> dist/`);
}

/**
 * Obtiene recursivamente todos los archivos .js de un directorio
 */
async function getJsFiles(dir) {
    let files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = [...files, ...(await getJsFiles(fullPath))];
        } else if (item.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * 2. Función principal de procesamiento
 */
async function runBuildTasks() {
    try {
        try {
            await fs.access(DIST_DIR);
        } catch {
            console.log(`⚠️ La carpeta ${DIST_DIR} no existe. Ejecuta el build primero.`);
            return;
        }

        console.log('🔧 Iniciando post-build tasks...');

        // PASO A: Copiar archivos
        await copyRootJsFiles();

        // PASO B: Procesar archivos en dist
        const files = await getJsFiles(DIST_DIR);
        let fixedImports = 0;
        let injectedDirname = 0;

        for (const file of files) {
            let content = await fs.readFile(file, 'utf-8');
            let hasChanges = false;

            // --- TAREA 1: Inyectar __dirname si se usa ---
            if (content.includes('__dirname') && !content.includes('const __dirname = __dirnamePath(__filename)')) {
                
                if (content.startsWith('#!')) {
                    const firstLineIndex = content.indexOf('\n');
                    const shebang = content.slice(0, firstLineIndex + 1);
                    const rest = content.slice(firstLineIndex + 1);
                    content = shebang + DIRNAME_SHIM + rest;
                } else {
                    content = DIRNAME_SHIM + content;
                }
                
                injectedDirname++;
                hasChanges = true;
            }

            // --- TAREA 2: Arreglar Imports (.js) ---
            const regex = /(from|import|export)(\s+['"])([.][^'"]+)(['"])/g;
            content = content.replace(regex, (match, keyword, spaceAndQuote, route, quoteEnd) => {
                // 1. Si ya tiene extensión .js o .json, ignorar
                if (route.endsWith('.js') || route.endsWith('.json')) return match;
                
                // 2. NUEVA VALIDACIÓN: Si la ruta contiene interpolación de strings (${...})
                // significa que es una plantilla generadora de código y no un import real.
                if (route.includes('${')) return match;
                
                hasChanges = true;
                fixedImports++; 
                return `${keyword}${spaceAndQuote}${route}.js${quoteEnd}`;
            });

            if (hasChanges) {
                await fs.writeFile(file, content, 'utf-8');
            }
        }

        console.log(`✨ Proceso completado en ${files.length} archivos.`);
        console.log(`   🔹 Imports corregidos en total: ${fixedImports}`);
        console.log(`   🔹 Shims __dirname inyectados: ${injectedDirname}`);

    } catch (error) {
        console.error("❌ Error en script post-build:", error);
        process.exit(1);
    }
}

runBuildTasks();