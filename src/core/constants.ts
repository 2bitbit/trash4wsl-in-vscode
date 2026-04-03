import * as vscode from "vscode";

export let IS_DEBUG: boolean;
export const setIS_DEBUG = (b: boolean) => {
  IS_DEBUG = b;
};

export const EXTENSION_ID = "2bitbit.trash4wsl-in-vscode";

export const packageJSON: any =
  vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON;
