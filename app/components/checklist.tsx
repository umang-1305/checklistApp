'use client'

import React, { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog"
import { Info, Trash2 } from 'lucide-react'
import { exportToCSV } from '@/app/lib/csvExport'

export type ColumnType = 'Task Number' | 'Task Name' | 'Step Name' | 'Designated Actor' | 'Remark' | string;

interface Column {
  name: ColumnType;
  visible: boolean;
  placeholder: string;
  inputType: 'text' | 'number' | 'select' | 'checkbox';
  options?: string[];
}

interface Row {
  id: string;
  [key: string]: string | boolean;
}

interface MainActorRow {
  mainActor: string;
  team: string;
  designation: string;
}

export default function Checklist() {
  const [columns, setColumns] = useState<Column[]>([
    { name: 'Task Number', visible: true, placeholder: '', inputType: 'number' },
    { name: 'Task Name', visible: true, placeholder: 'Enter Task name', inputType: 'text' },
    { name: 'Step Name', visible: true, placeholder: 'Enter Step Name', inputType: 'text' },
    { name: 'Designated Actor', visible: true, placeholder: 'Type Actor Name', inputType: 'select', options: ['Actor 1', 'Actor 2', 'Actor 3'] },
    { name: 'Remark', visible: true, placeholder: 'Show Remark', inputType: 'checkbox' },
  ]);
  
  const [rows, setRows] = useState<Row[]>([{
    id: '1',
    'Task Number': '01.',
    'Task Name': '',
    'Step Name': '',
    'Designated Actor': '',
    'Remark': false,
  }]);
  
  const [mainActorRows, setMainActorRows] = useState<MainActorRow[]>([
    { mainActor: '', team: '', designation: '' }
  ]);
  
  const [realTime, setRealTime] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<Column['inputType']>('text');
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  const handleAddRow = () => {
    const newRow: Row = {
      id: String(rows.length + 1),
      'Task Number': `${String(rows.length + 1).padStart(2, '0')}.`,
      'Task Name': '',
      'Step Name': '',
      'Designated Actor': '',
      'Remark': false,
    };
    setRows([...rows, newRow]);
  };

  const handleAddMainActorRow = () => {
    setMainActorRows([...mainActorRows, { mainActor: '', team: '', designation: '' }]);
  };

  const handleMainActorChange = (index: number, field: keyof MainActorRow, value: string) => {
    const newRows = [...mainActorRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setMainActorRows(newRows);
  };

  const handleCellChange = (rowIndex: number, columnName: string, value: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnName]: value };
    setRows(newRows);
  };

  const handleColumnToggle = (columnName: ColumnType) => {
    setColumns(columns.map(col =>
      col.name === columnName ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleAddCustomColumn = () => {
    if (newColumnName && newColumnType) {
      setColumns([...columns, {
        name: newColumnName,
        visible: true,
        placeholder: `Enter ${newColumnName}`,
        inputType: newColumnType,
        options: newColumnType === 'select' ? customOptions : undefined
      }]);
      setNewColumnName('');
      setNewColumnType('text');
      setCustomOptions([]);
    }
  };

  const handleAddCustomOption = () => {
    if (newOption && !customOptions.includes(newOption)) {
      setCustomOptions([...customOptions, newOption]);
      setNewOption('');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Checklist Module</h1>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-[#EAF2FF] text-[#4285F4] hover:bg-[#D3E3FF] rounded-full"
            onClick={() => setIsColumnDialogOpen(true)}
          >
            Configure Columns
          </Button>
          <Button 
            variant="outline" 
            className="bg-[#EAF2FF] text-[#4285F4] hover:bg-[#D3E3FF] rounded-full"
            onClick={() => exportToCSV(columns, rows)}
          >
            Export CSV
          </Button>
          <AlertDialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-[#4285F4] text-white hover:bg-[#3367D6] rounded-full">
                Publish changes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to publish changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently save your changes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Publish</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="text-gray-500 text-sm">
        Space and text size to share any instruction to user using this.
      </div>

      <div className="space-y-4">
        <table className="w-full">
          <thead>
            <tr>
              {columns.filter(col => col.visible).map((column) => (
                <th key={column.name} className="bg-[#EAF2FF] p-3 text-left text-[#4285F4] font-medium">
                  <div className="flex items-center gap-2">
                    {column.name}
                    <Info className="h-4 w-4" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {columns.filter(col => col.visible).map((column) => (
                  <td key={column.name} className="p-2">
                    {column.name === 'Task Number' ? (
                      <div className="bg-blue-50 p-2 rounded text-blue-600 font-medium w-16 text-center">
                        {row[column.name]}
                      </div>
                    ) : column.inputType === 'text' || column.inputType === 'number' ? (
                      <Input
                        type={column.inputType}
                        placeholder={column.placeholder}
                        value={row[column.name] as string}
                        onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
                        className="bg-gray-50"
                      />
                    ) : column.inputType === 'select' ? (
                      <Select
                        value={row[column.name] as string}
                        onValueChange={(value) => handleCellChange(rowIndex, column.name, value)}
                      >
                        <SelectTrigger className="bg-gray-50">
                          <SelectValue placeholder={column.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {column.options?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={row[column.name] as boolean}
                          onCheckedChange={(checked) => handleCellChange(rowIndex, column.name, checked)}
                          className="border-2 border-gray-300 rounded-sm"
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[#4285F4] bg-[#EAF2FF] hover:bg-[#D3E3FF] rounded-full"
          onClick={handleAddRow}
        >
          <span className="text-xl">+</span> Add Row
        </Button>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Main Actor Configuration</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="font-medium">Main Actor</div>
          <div className="font-medium">Team</div>
          <div className="font-medium">Designation</div>
          <div className="font-medium">Actions</div>
        </div>

        {mainActorRows.map((row, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center">
            <Select
              value={row.mainActor}
              onValueChange={(value) => handleMainActorChange(index, 'mainActor', value)}
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Select Actor" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="actor1">John</SelectItem>
                <SelectItem value="actor2">David</SelectItem>
                <SelectItem value="actor3">Joe</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={row.team}
              onValueChange={(value) => handleMainActorChange(index, 'team', value)}
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Enter Name" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="team1">QA</SelectItem>
                <SelectItem value="team2">QC</SelectItem>
                <SelectItem value="team3">IT</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={row.designation}
              onValueChange={(value) => handleMainActorChange(index, 'designation', value)}
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Type Object" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="designation1">Manager</SelectItem>
                <SelectItem value="designation2">Assistant</SelectItem>
                <SelectItem value="designation3">Deputy Manager</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-red-100 hover:text-red-600"
              onClick={() => {
                const newRows = [...mainActorRows];
                newRows.splice(index, 1);
                setMainActorRows(newRows);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          className="flex items-center gap-2 text-[#4285F4] hover:bg-[#EAF2FF] rounded-md"
          onClick={handleAddMainActorRow}
        >
          <span className="mr-2">+</span>
          Add Row
        </Button>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="real-time"
            checked={realTime}
            onCheckedChange={(checked) => setRealTime(checked as boolean)}
          />
          <label htmlFor="real-time" className="text-sm text-gray-600 cursor-pointer">
            Keep all as real time
          </label>
        </div>
      </div>

      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent className="bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Configure Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {columns.map((column, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{column.name}</span>
                <Checkbox
                  checked={column.visible}
                  onCheckedChange={() => handleColumnToggle(column.name)}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Input
                placeholder="New column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="bg-gray-50"
              />
              <Select value={newColumnType} onValueChange={setNewColumnType}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select column type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
              {newColumnType === 'select' && (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add option"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      className="bg-gray-50"
                    />
                    <Button onClick={handleAddCustomOption} variant="outline">Add Option</Button>
                  </div>
                  <div className="space-y-1">
                    {customOptions.map((option, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{option}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCustomOptions(customOptions.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleAddCustomColumn} className="w-full bg-[#4285F4] text-white hover:bg-[#3367D6]">
                Add Custom Column
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

