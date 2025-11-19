"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const execa_1 = __importDefault(require("execa"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const __1 = require("../..");
class WindowsClipboard {
    async readText() {
        let result;
        try {
            result = await (0, execa_1.default)(`${path_1.default.join(__dirname, '..', '..', 'bin', 'win_clipboard.exe')}`, ['--read'], {
                stripFinalNewline: true,
            });
        }
        catch (_a) {
            console.log('A try with fallback with powershell');
            result = await (0, execa_1.default)(`powershell -Command Add-Type -AssemblyName System.Windows.Forms; "if([Windows.Forms.Clipboard]::ContainsText()) {$clip=[Windows.Forms.Clipboard]::GetText(); if ($clip -ne $null) {return $clip }} "`, {
                stripFinalNewline: true,
            });
        }
        if (result && 'stderr' in result && result.stderr) {
            throw new Error(`cannot read text from clipboard because of error out: ${result.stderr}`);
        }
        return result && 'stdout' in result ? result.stdout : '';
    }
    async writeText(text) {
        let result;
        try {
            result = await (0, execa_1.default)(`${path_1.default.join(__dirname, '..', '..', 'bin', 'win_clipboard.exe')}`, ['--write', text]);
        }
        catch (_a) {
            console.log('A try with fallback with powershell');
            result = await (0, execa_1.default)('powershell -noprofile -command $input|Set-Clipboard', { input: text });
        }
        if (result && 'stderr' in result && result.stderr) {
            throw new Error(`cannot write text to clipboard because of error out: ${result.stderr}`);
        }
    }
    async readImage(file) {
        let result;
        try {
            result = await (0, execa_1.default)(`${path_1.default.join(__dirname, '..', '..', 'bin', 'win_clipboard.exe')}`, ['--readImage']);
        }
        catch (_a) {
            console.log('A try with fallback with powershell');
            result = await (0, execa_1.default)(`powershell -Command Add-Type -AssemblyName System.Windows.Forms; "$clip=[Windows.Forms.Clipboard]::GetImage();if ($clip -ne $null) { $converter = New-Object -TypeName System.Drawing.ImageConverter;$byte_vec = $converter.ConvertTo($clip, [byte[]]); $EncodedText =[Convert]::ToBase64String($byte_vec); return $EncodedText }"`);
        }
        if (result && 'stderr' in result && result.stderr) {
            throw new Error(`cannot read image from clipboard error: ${result.stderr}`);
        }
        let imageBuffer = Buffer.from(result.stdout, 'base64');
        if (file) {
            await fs_extra_1.default.writeFile(file, imageBuffer);
            return imageBuffer;
        }
        else {
            return imageBuffer;
        }
    }
    async writeImage(file) {
        let path = '';
        try {
            if (typeof file !== 'string') {
                const pathToTemp = path_1.default.join(process.cwd(), 'temp.png');
                await fs_extra_1.default.writeFile(pathToTemp, file);
                if (await fs_extra_1.default.existsSync(pathToTemp)) {
                    path = pathToTemp;
                }
            }
            else {
                path = file;
            }
            const { stderr } = await (0, execa_1.default)(`${path_1.default.join(__dirname, '..', '..', 'bin', 'win_clipboard.exe')}`, ['--writeImage', path]);
            if (stderr) {
                console.log('A try with fallback with powershell');
                const { stderr } = await (0, execa_1.default)(`powershell -Command Add-Type -AssemblyName System.Windows.Forms; "[Windows.Forms.Clipboard]::SetImage([System.Drawing.Image]::FromFile('${path}'));"`);
                if (stderr) {
                    throw new Error(`cannot write image to clipboard error: ${stderr}`);
                }
            }
        }
        catch (err) {
            throw new Error(err.message);
        }
        finally {
            if (typeof file !== 'string') {
                try {
                    if (fs_extra_1.default.existsSync(path)) {
                        await fs_extra_1.default.unlink(path);
                    }
                }
                catch (_a) { }
            }
        }
    }
    async readFiles() {
        let result;
        try {
            result = await (0, execa_1.default)(`${path_1.default.join(__dirname, '..', '..', 'bin', 'win_clipboard.exe')}`, ['--readFiles'], { stripFinalNewline: true });
        }
        catch (_a) {
            console.log('A try with fallback with powershell');
            result = await (0, execa_1.default)(`powershell -Command Add-Type -AssemblyName System.Windows.Forms; "if ([Windows.Forms.Clipboard]::ContainsFileDropList()) {$files = [Windows.Forms.Clipboard]::GetFileDropList(); return $files"}`, {
                stripFinalNewline: true,
            });
        }
        if (result && 'stderr' in result && result.stderr) {
            throw new Error(`cannot read files from clipboard error: ${result.stderr}`);
        }
        if (result.stdout) {
            const filePaths = result.stdout.split(/\r\n/g);
            filePaths.length && filePaths[filePaths.length - 1] === '' ? filePaths.pop() : filePaths;
            return filePaths;
        }
        else {
            return [];
        }
    }
    async pasteFiles(action, destinationFolder, ...files) {
        let result;
        if (files && files.length) {
            await this.writeFiles(...files);
        }
        try {
            result = await (0, execa_1.default)(`${path_1.default.join(__dirname, '..', '..', 'bin', 'win_clipboard.exe')}`, ['--moveFiles', action, destinationFolder], {
                stripFinalNewline: false,
            });
        }
        catch (_a) {
            result = await (0, execa_1.default)(`powershell -Command Add-Type -AssemblyName System.Windows.Forms; "$fileDrop = get-clipboard -Format FileDropList; if($fileDrop -eq $null) { write-host 'No files on the clipboard'; return } foreach($file in $fileDrop) {if (Test-Path $file) {if($file.Mode.StartsWith('d')) { $source = join-path $file.Directory $file.Name; Invoke-Expression '${action === 'Copy' ? 'copy' : 'move'}-item -Recurse $source $($file.Name)'} else {$file.Name; $file | ${action === __1.FilesActionEnum.Copy ? 'copy' : 'move'}-item -Destination "${destinationFolder}"}}}"`, {
                stripFinalNewline: false,
            });
        }
        if (result && 'stderr' in result && result.stderr) {
            throw new Error(`cannot read files from clipboard error: ${result.stderr}`);
        }
    }
    async writeFiles(...files) {
        let result;
        const formattedFiles = [];
        try {
            result = await (0, execa_1.default)(`${path_1.default.join(__dirname, '..', '..', 'bin', 'win_clipboard.exe')}`, ['--writeFiles', files.join(',')], { stripFinalNewline: false });
        }
        catch (_a) {
            files.forEach((f) => {
                formattedFiles.push(`('${f}')`);
            });
            result = await (0, execa_1.default)(`powershell -Command Add-Type -AssemblyName System.Windows.Forms; "$files = [System.Collections.Specialized.StringCollection]::new(); $files.AddRange(@(${formattedFiles.join(',')})); [Windows.Forms.Clipboard]::SetFileDropList($files);`, {
                stripFinalNewline: false,
            });
        }
        if (result && 'stderr' in result && result.stderr) {
            throw new Error(`cannot read files from clipboard error: ${result.stderr}`);
        }
        return result && 'stdout' in result && +result.stdout === 0;
    }
}
exports.default = WindowsClipboard;
//# sourceMappingURL=windows.js.map