// app/checklist/[type]/[workflow]/CellInput.tsx

import React from 'react';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';

interface CellConfig {
  type: string;
  options?: string[];
}

interface TaskRow {
  [key: string]: any;
  cellConfigs?: { [key: string]: CellConfig };
}

interface Column {
  name: string;
  visible: boolean;
  type?: string;
  options?: string[];
}

interface CellInputProps {
  row: TaskRow;
  rowIndex: number;
  column: Column;
  handleTaskChange: (rowIndex: number, columnName: string, value: any) => void;
  openFieldTypeDialog: (rowIndex: number, columnName: string) => void;
}

export const CellInput: React.FC<CellInputProps> = ({
  row,
  rowIndex,
  column,
  handleTaskChange,
  openFieldTypeDialog,
}) => {
  const cellConfig = row.cellConfigs?.[column.name] || {
    type: column.type,
    options: column.options,
  };

  if (cellConfig.type === 'blank') {
    return null;
  }

  const inputElement = (() => {
    switch (cellConfig.type) {
      case 'text':
        return (
          <Input
            value={row[column.name] || ''}
            onChange={(e) =>
              handleTaskChange(rowIndex, column.name, e.target.value)
            }
            className="bg-gray-100 text-gray-500 text-lg"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={row[column.name] || ''}
            onChange={(e) =>
              handleTaskChange(rowIndex, column.name, e.target.value)
            }
            className="bg-gray-50"
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={row[column.name] || false}
            onCheckedChange={(checked) =>
              handleTaskChange(rowIndex, column.name, checked)
            }
            className="border-2 border-gray-300 rounded-sm"
          />
        );
      case 'select':
        return (
          <Select
            value={row[column.name] || ''}
            onValueChange={(value) =>
              handleTaskChange(rowIndex, column.name, value)
            }
          >
            <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
              <SelectValue placeholder={`Select ${column.name}`} />
            </SelectTrigger>
            <SelectContent>
              {cellConfig.options?.map((option, optionIndex) => (
                <SelectItem key={optionIndex} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="flex flex-col space-y-2">
      {inputElement}
      {!cellConfig.type && (
        <Button
          variant="outline"
          size="sm"
          className="border-dashed border-[#4285F4] text-[#4285F4] hover:bg-[#EAF2FF]"
          onClick={() => openFieldTypeDialog(rowIndex, column.name)}
        >
          Set Field Type
        </Button>
      )}
    </div>
  );
};
