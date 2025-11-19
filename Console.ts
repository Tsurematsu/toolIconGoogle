import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import GoogleFonts from "./GoogleFonts";
import { selectDirectory } from "./selectDirectory";
import { selectFile } from "./selectFile";
import ExtractToFile from "./ExtractToFile";
inquirer.registerPrompt("autocomplete", autocomplete);

export default class Console {
    public static async menu() {
        let loop = true;
        while (loop) {
            console.clear();
            const options = {
                "Buscar icono": async () => {
                    console.clear()
                    await Console.search();
                },
                "Extraer de archivo": async () => {
                    const file = await selectFile();
                    if (file) {
                        console.log("Archivo seleccionado:", file);
                        await this.downloadIconToFile(file)
                    } else {
                        console.log("Cancelado.");
                    }
                },
                "Extraer de directorio": async () => {
                    const dir = await selectDirectory();

                    if (dir) {
                        console.log("Directorio seleccionado:", dir);
                    } else {
                        console.log("Cancelado.");
                    }
                },
                "Config dir descargas": async () => {
                    const dir = await selectDirectory();

                    if (dir) {
                        console.log("Directorio seleccionado:", dir);
                        GoogleFonts.setDirDownloads(dir)
                    } else {
                        console.log("Cancelado.");
                    }
                },
                "separator": "",
                "Salir": async () => { loop = false; }
            }
            const { option } = await inquirer.prompt([
                {
                    type: "list",
                    name: "option",
                    message: "Selecciona una opción:",
                    choices: Object.keys(options).map(e => e == "separator" ? new inquirer.Separator() : e)
                }
            ]);
            await options[option]?.()
        }
    }

    public static async search() {
        async function buscar(texto) {
            return await GoogleFonts.searchIcon(texto.toLowerCase())
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
        const result = await GoogleFonts.getIcon(String(respuesta.icono))
        console.log("Icon =>", result);
        await new Promise(r => setTimeout(r, 1000));
    }

    private static async downloadIconToFile(file){
        const iconsFound = ExtractToFile(file);
        for (const element of iconsFound) {
            const result = await GoogleFonts.getIcon(String(element))
            console.log("Icon =>", result);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}