import type { MoveDirection, Rule, RuleContainerId } from "@/src/domain/entities/rule";
import type { RuleWithLocation } from "@/src/domain/utils/rule-state";

export interface RuleFormValues extends Omit<Rule, "id" | "enabled"> {
  folderName?: string;
}

export interface FormHandlers {
  onSave: (id: number | null, values: RuleFormValues) => void;
  onCancel: () => void;
}

export interface FolderOption {
  id: string;
  name: string;
}

export interface ListCallbacks {
  onToggleRule: (id: number, enabled: boolean) => void;
  onToggleFolder: (folderId: string, enabled: boolean) => void;
  onToggleCollapse: (folderId: string) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onMoveFolder: (folderId: string, direction: MoveDirection) => void;
  onMoveRule: (folderId: RuleContainerId, id: number, direction: MoveDirection) => void;
}

export interface ImportExportHandlers {
  onSave: (jsonText: string) => Promise<void> | void;
  onCancel: () => void;
  getJson: () => string;
  fetchJsonFromUrl: (url: string) => Promise<string>;
  readJsonFile: (file: File) => Promise<string>;
}

export type EditableRule = RuleWithLocation | null;
