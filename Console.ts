import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import GoogleFonts from "./GoogleFonts";
inquirer.registerPrompt("autocomplete", autocomplete);

export default class Console {
    public static async menu(){
        
    }

    public static async search() {
        async function buscar(texto) {
            return await GoogleFonts.searchIcon(texto.toLowerCase())
        }
        const respuesta = await inquirer.prompt([
            {
                type: "autocomplete",
                name: "icono",
                message: "Busca una fruta:",
                source: (_answers, input) => buscar(input || "")
            }
        ]);
        console.log("Downloading... ", respuesta.icono);
        const result = await GoogleFonts.getIcon(String(respuesta.icono))
        console.log("Icon =>", result);

        await Console.search();
    }
}