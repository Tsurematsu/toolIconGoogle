import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import GoogleFonts from "./GoogleFonts";
import { selectDirectory } from "./selectDirectory";
import { selectFile } from "./selectFile";
import ExtractToFile from "./ExtractToFile";
import { getSourceFiles } from "./getFiles";
import MapImage from "./MapImage";
import InjectIcons from "./InjectIcons";
import { generateImageMap } from "./image-mapper";
import path from "path";
import fs from "fs";
inquirer.registerPrompt("autocomplete", autocomplete);

async function menuOptions(options : Record<string, any>, print = "Selecciona una opción:"){
    console.clear()
    const { option } = await inquirer.prompt([
        {
            type: "list",
            name: "option",
            message: print,
            choices: Object.keys(options).map(e => e.includes('separator') ? new inquirer.Separator() : e)
        }
    ]);
    await options[option]?.()
}

export default class Console {
    private static iconTime = 300;
    private static searchTime = 400;
    public static async menu() {
        try {
            const rutaBase = path.resolve(process.cwd(), "src", "assets")
            await fs.accessSync(rutaBase)
            await GoogleFonts.setDirDownloads(rutaBase)
        } catch (error) {
            await GoogleFonts.setDirDownloads(process.cwd())
        }
        let loop = true;
        while (loop) {
            console.clear();
            await menuOptions({
                "Buscar icono": async () => {
                    console.clear()
                    await GoogleFonts.init();
                    await new Promise(r => setTimeout(r, 3000));
                    await Console.search();
                    await new Promise(r => setTimeout(r, 3000));
                },
                "stitch google templates": async () => {await this.stitch_with_google_templates()},
                "Mapear imágenes": async () => {await this.MapearImágenes();},
                "Config": async () => {await this.Config()},
                "separator_0": "",
                "Salir": async () => { loop = false; },
                "separator_1": "",
            })
        }
        await GoogleFonts.close();
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

    private static async MapearImágenes() {
        await menuOptions({
            "for base": async () => {
                await MapImage(GoogleFonts.getDownloadPath(), null);
            },
            "for react": async () => {
                await MapImage(GoogleFonts.getDownloadPath(), "react");
            },
            "for static (vite ts)": async () => {
                const { value } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "value",
                        message: `Nombre modulo`,
                        validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                    }
                ]);
                const basePath = process.cwd()
                await generateImageMap(basePath, value);
            },
             "for static (vite js)": async () => {
                const { value } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "value",
                        message: `Nombre modulo`,
                        validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                    }
                ]);
                const basePath = process.cwd()
                await generateImageMap(basePath, value, 'js');
            },
            "for lit": async () => {
                await MapImage(GoogleFonts.getDownloadPath(), "lit");
            },
            "volver":()=>{},
        })
    }

    private static async RemplaceToSvg(){
        await menuOptions({
            "file": async () => {
                const file = await selectFile();
                if (!file) return;
                await InjectIcons(GoogleFonts.getDownloadPath(), file);
            },
            "directory": async () => {
                const dir = await selectDirectory();
                if (!dir) return;
                const allFiles = await getSourceFiles(dir);
                for (const element of allFiles) {
                    await InjectIcons(GoogleFonts.getDownloadPath(), element);
                    await new Promise(r => setTimeout(r, 100));
                }
            },
            "exit":()=>{},
        })
    }

    private static async Config(){
        await menuOptions({
            "dir descargas": async () => {
                const dir = await selectDirectory();
                if (!dir) return;
                console.log("Directorio seleccionado:", dir);
                await GoogleFonts.setDirDownloads(dir)
            },
            "time icon": async () => {
                const { value } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "value",
                        message: `[${this.iconTime}] Time get icon (ms)`,
                        validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                    }
                ]);
                try { this.iconTime = parseInt(value); } catch (error) { }
            },
            "time search": async () => {
                const { value } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "value",
                        message: `[${this.searchTime}] Time search (ms)`,
                        validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                    }
                ]);
                try { this.searchTime = parseInt(value); } catch (error) { }
            },
            "volver":async ()=>{},
        })
    }

    private static async stitch_with_google_templates(){
        await GoogleFonts.init();
        await new Promise(r => setTimeout(r, 3000));
        const extract = async()=>await menuOptions({
            "Archivo": async () => {
                const file = await selectFile();
                if (!file) return;
                console.log("Archivo seleccionado:", file);
                await this.downloadIconToFile(file)
                await new Promise(r => setTimeout(r, 1000));
            },
            "Recursivo": async () => {
                const dir = await selectDirectory();
                if (!dir) return;
                console.log("Directorio seleccionado:", dir);
                await this.downloadIconToDir(dir)
                await new Promise(r => setTimeout(r, 1000));
            },
            "volver":async ()=>{},
        })

        await menuOptions({
            "Extraer iconos": extract,
            "Implementar iconos": async () => {
                await this.RemplaceToSvg()
                await new Promise(r => setTimeout(r, 1000));
            },
            "volver":async ()=>{},
        })
    }
}