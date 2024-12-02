import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

interface CustomCellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: string, type: string) => void;
}

export const CustomCellDialog: React.FC<CustomCellDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [tag, setTag] = useState('');
  const [type, setType] = useState('');

  const handleSave = () => {
    onSave(tag, type);
    setTag('');
    setType('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <h2 className="text-lg font-medium">Set Tag and Cell Type</h2>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Enter Tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select Cell Type</option>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="checkbox">Checkbox</option>
            {/* Add more types as needed */}
          </select>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!tag || !type}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
