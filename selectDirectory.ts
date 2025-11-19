import inquirer from "inquirer";
import fs from "fs";
import path from "path";

/**
 * Navegación interactiva de directorios usando Inquirer.
 * @param startDir Directorio inicial
 * @returns Ruta final seleccionada por el usuario
 */
export async function selectDirectory(startDir: string = process.cwd()): Promise<string> {
  let currentDir = path.resolve(startDir);

  while (true) {
    console.clear()
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    // Filtra solo directorios
    const directories = items
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    // Opciones del menú
    const choices = [
      ...(currentDir !== "/" ? ["📁 .. (Subir)"] : []),
      ...directories.map((d) => `📂 ${d}`),
      new inquirer.Separator(),
      "✔️ Seleccionar este directorio",
      "❌ Cancelar"
    ];

    // Mostrar menú
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: `Directorio actual:\n${currentDir}\n\nSelecciona una carpeta:`,
        choices
      }
    ]);

    // ---- Lógica de navegación ----

    if (choice === "❌ Cancelar") return "";

    if (choice === "✔️ Seleccionar este directorio") {
      return currentDir;
    }

    if (choice === "📁 .. (Subir)") {
      currentDir = path.dirname(currentDir);
      continue;
    }

    if (choice.startsWith("📂 ")) {
      const folderName = choice.replace("📂 ", "");
      currentDir = path.join(currentDir, folderName);
      continue;
    }
  }
}
