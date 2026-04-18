// components/subjects/BulkActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Trash2,
  Download,
  X,
  Copy,
  RefreshCw,
} from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  onDelete,
  onExport,
}: BulkActionsProps) {
  return (
    <div className="hidden fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-primary p-2 shadow-lg text-secondary">
      <span className="px-2 text-sm font-medium">
        {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
      </span>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        <X className="mr-2 h-4 w-4" />
        Clear
      </Button>
      <div className="h-4 w-px bg-border" />
      <Button variant="ghost" size="sm" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="ghost" size="sm">
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </Button>
      <Button variant="ghost" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Change Status
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}