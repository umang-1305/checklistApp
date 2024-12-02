// app/checklist/[type]/[workflow]/ConfigureColumnsDialog.tsx

import React from 'react';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Info } from 'lucide-react';

interface Column {
  name: string;
  visible: boolean;
  type?: string;
  options?: string[];
}

interface ConfigureColumnsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  setColumns: (columns: Column[]) => void;
  newColumnName: string;
  setNewColumnName: (name: string) => void;
  addCustomColumn: () => void;
}

export const ConfigureColumnsDialog: React.FC<ConfigureColumnsDialogProps> = ({
  isOpen,
  onOpenChange,
  columns,
  setColumns,
  newColumnName,
  setNewColumnName,
  addCustomColumn,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Configure Columns</h2>
        </div>

        <div className="p-4 space-y-4">
          {columns.map((column, index) => (
            <div key={index} className="flex items-center gap-3">
              <Info className="w-4 h-4 text-gray-400" />
              <span className="flex-grow text-base">{column.name}</span>
              <Checkbox
                checked={column.visible}
                onCheckedChange={(checked) => {
                  const newColumns = [...columns];
                  newColumns[index] = {
                    ...column,
                    visible: checked as boolean,
                  };
                  setColumns(newColumns);
                }}
                className="rounded-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
            </div>
          ))}
          <div className="pt-2">
            <Input
              placeholder="New column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="focus:border-[#4285F4] transition-colors duration-200 text-base "
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white ml-auto"
              onClick={addCustomColumn}
            >
              Add Custom Column
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            Discard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
