'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trash2, X } from 'lucide-react'

interface CustomCellConfigProps {
  onSave: (config: { 
    type: string; 
    options?: string[];
    allowedInputs?: string[];
    remarkStates?: {
      checked: string;
      unchecked: string;
    };
  }) => void;
  onClose: () => void;
}

export function CustomCellConfig({ onSave, onClose }: CustomCellConfigProps) {
  const [selectedType, setSelectedType] = useState<string>('multi-select');
  const [columnHeading, setColumnHeading] = useState('');
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);
  const [newOption, setNewOption] = useState('');
  const [allowedInputs, setAllowedInputs] = useState<string[]>([]);
  const [remarkStates, setRemarkStates] = useState({
    checked: 'Completed',
    unchecked: 'Mark as Completed'
  });

  const handleSave = () => {
    const config = {
      type: selectedType,
      ...(selectedType === 'multi-select' || selectedType === 'single-select' ? { options } : {}),
      ...(selectedType === 'input-box' ? { allowedInputs } : {}),
      ...(selectedType === 'remark' ? { remarkStates } : {})
    };
    onSave(config);
  };

  const handleAddOption = () => {
    if (newOption && !options.includes(newOption)) {
      setOptions([...options, newOption]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleInputTypeChange = (value: string) => {
    setAllowedInputs(prev => {
      if (prev.includes(value)) {
        return prev.filter(type => type !== value);
      }
      return [...prev, value];
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Custom Inputs</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Input
            placeholder="Rename Column Heading"
            value={columnHeading}
            onChange={(e) => setColumnHeading(e.target.value)}
            className="mb-4"
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <RadioGroupItem value="multi-select" id="multi-select" />
                  <Label htmlFor="multi-select">Multi Select</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <RadioGroupItem value="single-select" id="single-select" />
                  <Label htmlFor="single-select">Single Select</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <RadioGroupItem value="input-box" id="input-box" />
                  <Label htmlFor="input-box">Input Box</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <RadioGroupItem value="remark" id="remark" />
                  <Label htmlFor="remark">Remark</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              {(selectedType === 'multi-select' || selectedType === 'single-select') && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>What options would you like to give?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={handleAddOption}
                    >
                      + Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center justify-between gap-2">
                        <Input value={option} readOnly />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === 'input-box' && (
                <div>
                  <h3 className="mb-4">What type of input can it take</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alphabets"
                        checked={allowedInputs.includes('Alphabets')}
                        onCheckedChange={() => handleInputTypeChange('Alphabets')}
                      />
                      <Label htmlFor="alphabets">Alphabets</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="numbers"
                        checked={allowedInputs.includes('Numbers')}
                        onCheckedChange={() => handleInputTypeChange('Numbers')}
                      />
                      <Label htmlFor="numbers">Numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="special"
                        checked={allowedInputs.includes('Special characters')}
                        onCheckedChange={() => handleInputTypeChange('Special characters')}
                      />
                      <Label htmlFor="special">Special characters</Label>
                    </div>
                  </div>
                </div>
              )}

              {selectedType === 'remark' && (
                <div>
                  <h3 className="mb-4">Remark States</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Checked</Label>
                      <div className="mt-1 p-2 bg-green-50 text-green-600 rounded-lg border border-green-200 flex items-center justify-between">
                        <span>{remarkStates.checked}</span>
                        <div className="bg-green-500 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Unchecked</Label>
                      <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 flex items-center justify-between">
                        <span>{remarkStates.unchecked}</span>
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex justify-between">
          <Button variant="ghost" onClick={onClose}>
            Discard
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save & Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

