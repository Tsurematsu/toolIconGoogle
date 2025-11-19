import inquirer from "inquirer";
import fs from "fs";
import path from "path";

/**
 * Navega por el sistema de archivos y permite seleccionar un archivo.
 * @param startDir Directorio inicial
 * @returns Ruta completa del archivo seleccionado o "" si se cancela
 */
export async function selectFile(startDir: string = process.cwd()): Promise<string> {
  let currentDir = path.resolve(startDir);

  while (true) {
    console.clear()
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    const directories = items
      .filter((item) => item.isDirectory())
      .map((item) => `📂 ${item.name}`);

    const files = items
      .filter((item) => item.isFile())
      .map((item) => `📄 ${item.name}`);

    const choices = [
      ...(currentDir !== "/" ? ["📁 .. (Subir)"] : []),
      ...directories,
      ...files,
      new inquirer.Separator(),
      "❌ Cancelar"
    ];

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: `Directorio actual:\n${currentDir}\n\nSelecciona un archivo o carpeta:`,
        choices
      }
    ]);

    // Cancelar
    if (choice === "❌ Cancelar") return "";

    // Subir
    if (choice === "📁 .. (Subir)") {
      currentDir = path.dirname(currentDir);
      continue;
    }

    // Carpetas
    if (choice.startsWith("📂 ")) {
      const folderName = choice.replace("📂 ", "");
      currentDir = path.join(currentDir, folderName);
      continue;
    }

    // Archivos
    if (choice.startsWith("📄 ")) {
      const fileName = choice.replace("📄 ", "");
      return path.join(currentDir, fileName);
    }
  }
}
