/// <reference types="node" />
export declare enum FilesActionEnum {
    Copy = "Copy",
    Cut = "Cut"
}
export type FilesActionType = 'Copy' | 'Cut';
export interface SysClipboard {
    readText(): Promise<string>;
    writeText(text: string): Promise<void>;
    readImage(file?: string): Promise<Buffer>;
    writeImage(file: string | Buffer): Promise<void>;
    readFiles(): Promise<Array<string>>;
    pasteFiles(action: FilesActionType, destinationFolder: string, ...files: Array<string>): Promise<void>;
    writeFiles(...files: Array<string>): Promise<boolean>;
}
export declare const clipboard: SysClipboard;
//# sourceMappingURL=index.d.ts.map