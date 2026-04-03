import * as vscode from "vscode";

export let IS_DEBUG: boolean;

export const setIS_DEBUG = (b: boolean) => { IS_DEBUG = b; };

export const EXTENSION_ID = "2bitbit.trash4wsl-in-vscode";

export const packageJSON: any = vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON;

/*trash-restore输出格式（.表示空格）： ...0 2025-05-31 17:28:28 /home/finnwsl/test-wsl/dir
                                     ...1 2025-05-31 17:36:04 /home/finnwsl/test-wsl/sample.txt
                                     What file to restore [0..1]:.

No files trashed from current dir ('/home/finnwsl/repos/vscode-ext-dev-playground')
*/
