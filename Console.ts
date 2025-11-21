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
import { getSystemLanguage, TextOptionsEnglish, TextOptionsSpanish } from "./TextOptions";
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
    private static keyWordsOptions = null;
    public static async menu() {
        const lang = getSystemLanguage();
        const arrOptions = {
            "es":TextOptionsSpanish,
            "en":TextOptionsEnglish,
        }
        this.keyWordsOptions =  arrOptions[lang];
        
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
                    await Console.search();
                    await new Promise(r => setTimeout(r, 3000));
                },
                [this.keyWordsOptions["Stitch Google templates"]]: async () => {await this.stitch_with_google_templates()},
                [this.keyWordsOptions["Mapear imágenes"]]: async () => {await this.MapearImágenes();},
                [this.keyWordsOptions["Config"]]: async () => {await this.Config()},
                "separator_0": "",
                [this.keyWordsOptions["Salir"]]: async () => { loop = false; },
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
                message: this.keyWordsOptions["Buscar un icono:"],
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
            [this.keyWordsOptions["For base"]]: async () => {
                await MapImage(GoogleFonts.getDownloadPath(), null);
            },
            [this.keyWordsOptions["For react"]]: async () => {
                await MapImage(GoogleFonts.getDownloadPath(), "react");
            },
            [this.keyWordsOptions["For static (vite ts)"]]: async () => {
                const { value } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "value",
                        message: this.keyWordsOptions[`Nombre modulo`],
                        validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                    }
                ]);
                const basePath = process.cwd()
                try {
                    await generateImageMap(basePath, String(value).replaceAll(" ", "_"));
                } catch (error) {
                    console.log("Nombre invalido");
                    await new Promise(r => setTimeout(r, 3000));
                }
            },
             [this.keyWordsOptions["For static (vite js)"]]: async () => {
                const { value } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "value",
                        message: this.keyWordsOptions[`Nombre modulo`],
                        validate: (v) => v.trim() === "" ? "No puede estar vacío" : true,
                    }
                ]);
                const basePath = process.cwd()
                try {
                    await generateImageMap(basePath, String(value).replaceAll(" ", "_"), 'js');
                } catch (error) {
                    console.log("Nombre invalido");
                    await new Promise(r => setTimeout(r, 3000));
                }
            },
            [this.keyWordsOptions["For lit"]]: async () => {
                await MapImage(GoogleFonts.getDownloadPath(), "lit");
            },
            [this.keyWordsOptions["Volver"]]:()=>{},
        })
    }

    private static async RemplaceToSvg(){
        await menuOptions({
            [this.keyWordsOptions["Archivo"]]: async () => {
                const file = await selectFile();
                if (!file) return;
                await InjectIcons(GoogleFonts.getDownloadPath(), file);
            },
            [this.keyWordsOptions["Directorio"]]: async () => {
                const dir = await selectDirectory();
                if (!dir) return;
                const allFiles = await getSourceFiles(dir);
                for (const element of allFiles) {
                    await InjectIcons(GoogleFonts.getDownloadPath(), element);
                    await new Promise(r => setTimeout(r, 100));
                }
            },
            [this.keyWordsOptions["Volver"]]:()=>{},
        })
    }

    private static async Config(){
        await menuOptions({
            [this.keyWordsOptions["Dir descargas"]]: async () => {
                const dir = await selectDirectory();
                if (!dir) return;
                console.log("Directorio seleccionado:", dir);
                await GoogleFonts.setDirDownloads(dir)
            },
            [this.keyWordsOptions["Time icon"]]: async () => {
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
            [this.keyWordsOptions["Time search"]]: async () => {
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
            [this.keyWordsOptions["Volver"]]:async ()=>{},
        })
    }

    private static async stitch_with_google_templates(){
        await GoogleFonts.init();
        const extract = async()=>await menuOptions({
            [this.keyWordsOptions["Archivo"]]: async () => {
                const file = await selectFile();
                if (!file) return;
                console.log("Archivo seleccionado:", file);
                await this.downloadIconToFile(file)
                await new Promise(r => setTimeout(r, 1000));
            },
            [this.keyWordsOptions["Recursivo"]]: async () => {
                const dir = await selectDirectory();
                if (!dir) return;
                console.log("Directorio seleccionado:", dir);
                await this.downloadIconToDir(dir)
                await new Promise(r => setTimeout(r, 1000));
            },
            [this.keyWordsOptions["Volver"]]:async ()=>{},
        })

        await menuOptions({
            [this.keyWordsOptions["Extraer iconos"]]: extract,
            [this.keyWordsOptions["Implementar iconos"]]: async () => {
                await this.RemplaceToSvg()
                await new Promise(r => setTimeout(r, 1000));
            },
            [this.keyWordsOptions["Volver"]]:async ()=>{},
        })
    }
}