/**
 * 外源 Node 扩展 (Rust NAPI) 的类型声明文件。
 * 这代表了跨语言交界处的契约。
 */

export interface TrashItemNode {
  id: string;
  name: string;
  originalParent: string;
  timeDeleted: number;
  isDir: boolean;
}

export interface TrashBackend {
  moveToTrash(paths: string[]): void;
  listWorkspaceTrash(pathPrefix: string): TrashItemNode[];
  restoreTrashItems(ids: string[]): void;
  emptyTrash(): void;
  purgeTrashItems(ids: string[]): void;
}
