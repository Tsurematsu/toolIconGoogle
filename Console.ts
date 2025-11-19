import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import GoogleFonts from "./GoogleFonts";
import { selectDirectory } from "./selectDirectory";
import { selectFile } from "./selectFile";
import ExtractToFile from "./ExtractToFile";
import { getSourceFiles } from "./getFiles";
inquirer.registerPrompt("autocomplete", autocomplete);

export default class Console {
    private static iconTime = 600;
    private static searchTime = 400;
    public static async menu() {
        let loop = true;
        while (loop) {
            console.clear();
            const options = {
                "Buscar icono": async () => {
                    console.clear()
                    await Console.search();
                    await new Promise(r => setTimeout(r, 1000));
                },
                "Extraer de archivo": async () => {
                    const file = await selectFile();
                    if (!file) return;
                    console.log("Archivo seleccionado:", file);
                    await this.downloadIconToFile(file)
                    await new Promise(r => setTimeout(r, 1000));
                },
                "Extraer de directorio": async () => {
                    const dir = await selectDirectory();
                    if (!dir) return;
                    console.log("Directorio seleccionado:", dir);
                    await this.downloadIconToDir(dir)
                    await new Promise(r => setTimeout(r, 1000));
                },
                "Config dir descargas": async () => {
                    const dir = await selectDirectory();
                    if (!dir) return;
                    console.log("Directorio seleccionado:", dir);
                    await GoogleFonts.setDirDownloads(dir)
                },
                "Config time get icon": async () => {
                    const { value } = await inquirer.prompt([
                        {
                            type: "input",
                            name: "value",
                            message: `[${this.iconTime}] Time get icon (ms)`,
                            validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                        }
                    ]);
                    try {this.iconTime = parseInt(value);} catch (error) {}
                },
                "Config time search icons": async () => {
                    const { value } = await inquirer.prompt([
                        {
                            type: "input",
                            name: "value",
                            message: `[${this.searchTime}] Time search (ms)`,
                            validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                        }
                    ]);
                    try {this.searchTime = parseInt(value);} catch (error) {}
                },
                "separator_0": "",
                "Salir": async () => { loop = false; },
                "separator_1": "",
            }
            const { option } = await inquirer.prompt([
                {
                    type: "list",
                    name: "option",
                    message: "Selecciona una opción:",
                    choices: Object.keys(options).map(e => e.includes('separator') ? new inquirer.Separator() : e)
                }
            ]);
            await options[option]?.()
        }
    }

    public static async search() {
        const buscar = async (texto) => {
            return await GoogleFonts.searchIcon(texto.toLowerCase(), this.searchTime)
        }
        const respuesta = await inquirer.prompt([
            {
                type: "autocomplete",
                name: "icono",
                message: "Busca un icono:",
                source: (_answers, input) => buscar(input || "")
            }
        ]);
        console.log("Downloading... ", respuesta.icono);
        const result = await GoogleFonts.getIcon(String(respuesta.icono), this.iconTime)
        console.log("Icon =>", result);
    }

    private static async downloadIconToFile(file) {
        const iconsFound = ExtractToFile(file);
        for (const element of iconsFound) {
            const result = await GoogleFonts.getIcon(String(element), this.iconTime)
            console.log("Icon =>", result);
        }
    }

    private static async downloadIconToDir(dir) {
        const allFiles = await getSourceFiles(dir);
        for (const element of allFiles) {
            await this.downloadIconToFile(element);
        }
    }
}