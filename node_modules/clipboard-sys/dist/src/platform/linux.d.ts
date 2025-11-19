/// <reference types="node" />
import { FilesActionType, SysClipboard } from '../..';
export default class LinuxClipboard implements SysClipboard {
    readFiles(): Promise<Array<string>>;
    pasteFiles(action: FilesActionType, destinationFolder: string, ...files: Array<string>): Promise<void>;
    writeFiles(...files: string[]): Promise<boolean>;
    readText(): Promise<string>;
    writeText(text: string): Promise<void>;
    readImage(file?: string): Promise<Buffer>;
    writeImage(file: string | Buffer): Promise<void>;
}
//# sourceMappingURL=linux.d.ts.map