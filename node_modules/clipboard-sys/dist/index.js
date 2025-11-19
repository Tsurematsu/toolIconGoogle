"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clipboard = exports.FilesActionEnum = void 0;
const darwin_1 = __importDefault(require("./src/platform/darwin"));
const linux_1 = __importDefault(require("./src/platform/linux"));
const windows_1 = __importDefault(require("./src/platform/windows"));
var FilesActionEnum;
(function (FilesActionEnum) {
    FilesActionEnum["Copy"] = "Copy";
    FilesActionEnum["Cut"] = "Cut";
})(FilesActionEnum = exports.FilesActionEnum || (exports.FilesActionEnum = {}));
exports.clipboard = (() => {
    switch (process.platform) {
        case 'darwin':
            return new darwin_1.default();
        case 'win32':
            return new windows_1.default();
        case 'linux':
            return new linux_1.default();
        default:
            throw new Error('unsupported os');
    }
})();
//# sourceMappingURL=index.js.map