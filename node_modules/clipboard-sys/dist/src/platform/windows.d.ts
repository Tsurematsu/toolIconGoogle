/// <reference types="node" />
import { FilesActionType, SysClipboard } from '../..';
export default class WindowsClipboard implements SysClipboard {
    readText(): Promise<string>;
    writeText(text: string): Promise<void>;
    readImage(file?: string): Promise<Buffer>;
    writeImage(file: string | Buffer): Promise<void>;
    readFiles(): Promise<string[]>;
    pasteFiles(action: FilesActionType, destinationFolder: string, ...files: Array<string>): Promise<void>;
    writeFiles(...files: Array<string>): Promise<boolean>;
}
//# sourceMappingURL=windows.d.ts.map