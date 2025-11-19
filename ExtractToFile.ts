import fs from 'fs';

export default function ExtractToFile(path) {
  try {
    // 1. Verificar si el archivo existe
    if (!fs.existsSync(path)) {
      console.error(`El archivo no existe en la ruta: ${path}`);
      return [];
    }

    // 2. Leer el contenido del archivo
    const content = fs.readFileSync(path, 'utf-8');

    // 3. Definir la expresión regular (Regex)
    // Explicación:
    // <\w+            -> Busca el inicio de una etiqueta (ej: <span, <div)
    // [^>]*?          -> Cualquier carácter (atributos) de forma "lazy"
    // className=["']  -> Busca el atributo className con comillas simples o dobles
    // [^"']*?         -> Contenido previo dentro de la clase
    // \bmaterial-symbols-outlined\b -> LA CLAVE: Busca tu clase específica
    // [^"']*?["']     -> El resto de la clase y cierre de comillas
    // [^>]*?>         -> El resto de los atributos hasta cerrar la etiqueta >
    // ([\s\S]*?)      -> GRUPO DE CAPTURA: El contenido dentro (incluyendo saltos de linea)
    // <\/\w+>         -> Cierre de la etiqueta
    const regex = /<\w+[^>]*?\bclassName=["'][^"']*?\bmaterial-symbols-outlined\b[^"']*?["'][^>]*?>([\s\S]*?)<\/\w+>/g;

    const icons = new Set(); // Usamos un Set para evitar duplicados automáticamente
    let match;

    // 4. Iterar sobre todas las coincidencias encontradas
    while ((match = regex.exec(content)) !== null) {
      const rawContent = match[1].trim();

      if (!rawContent) continue;

      // 5. Lógica de limpieza
      // Caso A: Es una expresión de JavaScript (ej: {condicion ? 'icon1' : 'icon2'})
      if (rawContent.startsWith('{') && rawContent.endsWith('}')) {
        // Buscamos cadenas de texto dentro de las llaves (entre comillas simples o dobles)
        const stringMatches = rawContent.match(/['"]([^'"]+)['"]/g);
        if (stringMatches) {
          stringMatches.forEach(str => {
            // Eliminar las comillas y agregar al Set
            icons.add(str.replace(/['"]/g, ''));
          });
        }
      } 
      // Caso B: Es texto plano directo (ej: account_balance)
      else {
        icons.add(rawContent);
      }
    }

    // 6. Retornar como arreglo
    return Array.from(icons);

  } catch (error) {
    console.error("Ocurrió un error al procesar el archivo:", error);
    return [];
  }
}