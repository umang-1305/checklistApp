import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"

interface FieldTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnName: string;
  onSave: (config: { type: string; options?: string[] }) => void;
}

export function FieldTypeDialog({
  open,
  onOpenChange,
  columnName,
  onSave
}: FieldTypeDialogProps) {
  const [fieldType, setFieldType] = useState('text');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (open) {
      setFieldType('text');
      setOptions([]);
      setNewOption('');
    }
  }, [open]);

  const handleSave = () => {
    onSave({
      type: fieldType,
      options: fieldType === 'select' || fieldType === 'multi-select' ? options : undefined
    });
  };

  const addOption = () => {
    if (newOption && !options.includes(newOption)) {
      setOptions([...options, newOption]);
      setNewOption('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Set Field Type for {columnName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select value={fieldType} onValueChange={setFieldType}>
            <SelectTrigger className="bg-white border border-gray-300">
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="multi-select">Multi Select</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>

          {(fieldType === 'select' || fieldType === 'multi-select') && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="bg-gray-50"
                />
                <Button 
                  onClick={addOption}
                  className="bg-[#4285F4] text-white hover:bg-[#3367D6]"
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{option}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button 
          onClick={handleSave}
          className="bg-[#4285F4] text-white hover:bg-[#3367D6]"
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}

