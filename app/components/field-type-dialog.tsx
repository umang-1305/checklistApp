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
  initialConfig?: { type: string; options?: string[] };
  onConfigChange?: (config: { type: string; options?: string[] }) => void;
}

export function FieldTypeDialog({
  open,
  onOpenChange,
  columnName,
  onSave,
  initialConfig,
  onConfigChange
}: FieldTypeDialogProps) {
  const [fieldType, setFieldType] = useState(initialConfig?.type || '');
  const [options, setOptions] = useState<string[]>(initialConfig?.options || []);
  const [newOption, setNewOption] = useState('');

  // Update parent component with real-time changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        type: fieldType,
        options: fieldType === 'select' || fieldType === 'multi-select' ? options : undefined
      });
    }
  }, [fieldType, options, onConfigChange]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFieldType(initialConfig?.type || '');
      setOptions(initialConfig?.options || []);
      setNewOption('');
    }
  }, [open, initialConfig]);

  const handleSave = () => {
    onSave({
      type: fieldType,
      options: fieldType === 'select' || fieldType === 'multi-select' ? options : undefined
    });
  };

  const addOption = () => {
    if (newOption && !options.includes(newOption)) {
      const updatedOptions = [...options, newOption];
      setOptions(updatedOptions);
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
          <Select 
            value={fieldType} 
            onValueChange={(value) => {
              setFieldType(value);
              if (value !== 'select' && value !== 'multi-select') {
                setOptions([]);
              }
            }}
          >
            <SelectTrigger className="bg-white border border-gray-300">
              <SelectValue placeholder="Select" />
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
                      onClick={() => {
                        const updatedOptions = options.filter((_, i) => i !== index);
                        setOptions(updatedOptions);
                      }}
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