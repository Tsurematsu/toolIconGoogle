/// <reference types="node" />
import { FilesActionType, SysClipboard } from '../..';
export default class DarwinClipboard implements SysClipboard {
    readFiles(): Promise<any>;
    pasteFiles(action: FilesActionType, destinationFolder: string, ...files: Array<string>): Promise<void>;
    writeFiles(...files: string[]): Promise<boolean>;
    readText(): Promise<string>;
    writeText(text: string): Promise<void>;
    readImage(file?: string): Promise<Buffer>;
    writeImage(file: string | Buffer): Promise<void>;
}
//# sourceMappingURL=darwin.d.ts.map