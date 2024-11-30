'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { Info, ChevronDown, ChevronRight } from 'lucide-react'
import { FieldTypeDialog } from '../../components/field-type-dialog'

interface MainActorRow {
  actions: string;
  mainActor: string;
  team: string;
  designation: string;
}

interface EntityType {
  name: string;
  value: string;
  children?: EntityType[];
}

interface CellConfig {
  type: string;
  options?: string[];
}

interface TaskRow {
  id: string;
  taskNumber: string;
  taskName: string;
  actions: string;
  remark: boolean;
  entityType: string[];
  route: string;
  [key: string]: any; // For custom columns
  cellConfigs?: { [key: string]: CellConfig };
}

interface EditingCell {
  rowIndex: number;
  columnName: string;
}

interface Column {
  name: string;
  visible: boolean;
  type?: string;
  options?: string[];
}

interface ChecklistProps {
  params: {
    type: string;
  }
}

export default function Checklist({ params }: ChecklistProps) {
  const { type } = params;

  const [mainActorRows, setMainActorRows] = useState<MainActorRow[]>([{
    actions: '',
    mainActor: '',
    team: '',
    designation: ''
  }]);

  const [taskRows, setTaskRows] = useState<TaskRow[]>([{
    id: '1',
    taskNumber: '01.',
    taskName: '',
    actions: '',
    remark: false,
    entityType: [],
    route: ''
  }]);

  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { name: 'Task Number', visible: true },
    { name: 'Task Name', visible: true },
    { name: 'Actions', visible: true },
    { name: 'Remark', visible: true },
    { name: 'Entity Type/Objects', visible: true },
    { name: 'Route', visible: true },
  ]);

  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('blank');
  const [newColumnOptions, setNewColumnOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [isFieldTypeDialogOpen, setIsFieldTypeDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const entityTypes: EntityType[] = [
    {
      name: 'Machine',
      value: 'machine',
      children: [
        { name: 'Machine 1', value: 'machine_1' },
        { name: 'Machine 2', value: 'machine_2' },
        { name: 'Machine 3', value: 'machine_3' },
      ]
    },
    {
      name: 'Raw Material',
      value: 'raw_material',
      children: [
        { name: 'Raw Material 1', value: 'raw_material_1' },
        { name: 'Raw Material 2', value: 'raw_material_2' },
        { name: 'Raw Material 3', value: 'raw_material_3' },
      ]
    },
    {
      name: 'Lots',
      value: 'lots',
      children: [
        { name: 'Lot 1', value: 'lot_1' },
        { name: 'Lot 2', value: 'lot_2' },
        { name: 'Lot 3', value: 'lot_3' },
      ]
    }
  ];

  const handleAddMainActorRow = () => {
    setMainActorRows([...mainActorRows, { actions: '', mainActor: '', team: '', designation: '' }]);
  };

  const handleMainActorChange = (index: number, field: keyof MainActorRow, value: string) => {
    const newRows = [...mainActorRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setMainActorRows(newRows);
  };

  const handleAddTaskRow = () => {
    const newRow: TaskRow = {
      id: String(taskRows.length + 1),
      taskNumber: `${String(taskRows.length + 1).padStart(2, '0')}.`,
      taskName: '',
      actions: '',
      remark: false,
      entityType: [],
      route: ''
    };
    setTaskRows([...taskRows, newRow]);
  };

  const handleTaskChange = (rowIndex: number, field: keyof TaskRow | string, value: any) => {
    setTaskRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
      return newRows;
    });
  };

  const handleCustomColumnChange = (value: any, rowIndex: number, column: Column) => {
    const newRows = [...taskRows];
    newRows[rowIndex] = { ...newRows[rowIndex], [column.name]: value };
    setTaskRows(newRows);
  };

  const handleEntityTypeChange = (rowIndex: number, selectedValues: string[]) => {
    const newRows = [...taskRows];
    newRows[rowIndex].entityType = selectedValues;
    setTaskRows(newRows);
  };

  const addCustomColumn = () => {
    if (newColumnName) {
      const newColumn: Column = { 
        name: newColumnName, 
        visible: true, 
        type: newColumnType 
      };
      if (newColumnType === 'select') {
        newColumn.options = newColumnOptions;
      }
      setColumns([...columns, newColumn]);
      setNewColumnName('');
      setNewColumnType('blank');
      setNewColumnOptions([]);
      setNewOptionInput('');
      setTaskRows(taskRows.map(row => ({ ...row, [newColumnName]: newColumnType === 'checkbox' ? false : '' })));
    }
  };

  const addOption = () => {
    if (newOptionInput && !newColumnOptions.includes(newOptionInput)) {
      setNewColumnOptions([...newColumnOptions, newOptionInput]);
      setNewOptionInput('');
    }
  };

  const openFieldTypeDialog = (rowIndex: number, columnName: string) => {
    setEditingCell({ rowIndex, columnName });
    setIsFieldTypeDialogOpen(true);
  };

  const handleCellConfigSave = (config: CellConfig) => {
    if (editingCell) {
      const updatedTaskRows = [...taskRows];
      if (!updatedTaskRows[editingCell.rowIndex].cellConfigs) {
        updatedTaskRows[editingCell.rowIndex].cellConfigs = {};
      }
      updatedTaskRows[editingCell.rowIndex].cellConfigs[editingCell.columnName] = config;
      setTaskRows(updatedTaskRows);
    }
    setIsFieldTypeDialogOpen(false);
    setEditingCell(null);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Checklist` : 'Checklist & Sign'}
        </h1>
        <Button className="bg-[#4285F4] text-white hover:bg-[#3367D6] rounded-full">
          Publish changes
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="font-medium">Actions</div>
          <div className="font-medium">Main Actor</div>
          <div className="font-medium">Team</div>
          <div className="font-medium">Designation</div>
        </div>

        {mainActorRows.map((row, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center">
            <Input
              placeholder="Aa"
              value={row.actions}
              onChange={(e) => handleMainActorChange(index, 'actions', e.target.value)}
              className="bg-gray-50"
            />
            <Select
              value={row.mainActor}
              onValueChange={(value) => handleMainActorChange(index, 'mainActor', value)}
            >
              <SelectTrigger className="bg-white border border-gray-300">
                <SelectValue placeholder="Select actor" />
              </SelectTrigger>
              <SelectContent  className='bg-white'>
                <SelectItem value="john">John</SelectItem>
                <SelectItem value="david">David</SelectItem>
                <SelectItem value="joe">Joe</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={row.team}
              onValueChange={(value) => handleMainActorChange(index, 'team', value)}
            >
              <SelectTrigger className="bg-white border border-gray-300">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="qc">QC</SelectItem>
                <SelectItem value="it">IT</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={row.designation}
              onValueChange={(value) => handleMainActorChange(index, 'designation', value)}
            >
              <SelectTrigger className="bg-white border border-gray-300">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="deputy">Deputy Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}

        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[#4285F4] hover:bg-[#EAF2FF]"
          onClick={handleAddMainActorRow}
        >
          <span className="mr-2">+</span>
          Add Row
        </Button>
        <Button className="ml-4 bg-[#4285F4] text-white hover:bg-[#3367D6]">
          Save
        </Button>
      </div>

      <div className="space-y-6 mt-8">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            The below columns are designed for you to decide what aspects you want your team to include while carrying out their work.
            <div className="text-gray-500">
              Unattended Column means that it will not be shown in the application.
            </div>
          </div>
          <Button 
            variant="outline" 
            className="bg-[#EAF2FF] text-[#4285F4] hover:bg-[#D3E3FF] rounded-full"
            onClick={() => setIsColumnDialogOpen(true)}
          >
            Configure Columns
          </Button>
        </div>

        <div className="space-y-4">
          <table className="w-full">
            <thead>
              <tr>
                {columns.filter(col => col.visible).map((column) => (
                  <th key={column.name} className="bg-[#EAF2FF] p-3 text-left text-[#4285F4] font-medium">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {column.name}
                        <Info className="h-4 w-4" />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {taskRows.map((row, rowIndex) => (
                <tr key={row.id}>
                  <td className="p-2">
                    <div className="bg-[#EAF2FF] p-2 rounded text-[#4285F4] font-medium w-16 text-center">
                      {row.taskNumber}
                    </div>
                  </td>
                  <td className="p-2">
                    <Input
                      placeholder="Enter Task name"
                      value={row.taskName}
                      onChange={(e) => handleTaskChange(rowIndex, 'taskName', e.target.value)}
                      className="bg-gray-50"
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={row.actions}
                      onValueChange={(value) => handleTaskChange(rowIndex, 'actions', value)}
                    >
                      <SelectTrigger className="bg-white border border-gray-300">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent className='bg-white'>
                        {mainActorRows.map((mainRow, index) => (
                          mainRow.actions && (
                            <SelectItem key={index} value={mainRow.actions}>
                              {mainRow.actions}
                            </SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center justify-center border border-gray-300 rounded p-2 bg-white">
                      <Checkbox
                        checked={row.remark}
                        onCheckedChange={(checked) => handleTaskChange(rowIndex, 'remark', checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Show remark</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Select
                      value={row.entityType}
                      onValueChange={(value) => handleEntityTypeChange(rowIndex, Array.isArray(value) ? value : [value])}
                      multiple
                    >
                      <SelectTrigger className="bg-white border border-gray-300">
                        <SelectValue placeholder="Select entity type/objects" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded mt-2">
                        {entityTypes.map((parent) => {
                          const allChildrenSelected = parent.children.every((child) => row.entityType.includes(child.value));
                          return (
                            <React.Fragment key={parent.value}>
                              <div className="flex items-center px-2 py-1">
                                <input
                                  type="checkbox"
                                  checked={allChildrenSelected}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    handleEntityTypeChange(
                                      rowIndex,
                                      isChecked
                                        ? [...row.entityType, parent.value, ...parent.children.map((child) => child.value)]
                                        : row.entityType.filter(
                                            (type) => type !== parent.value && !parent.children.some((child) => child.value === type)
                                          )
                                    );
                                  }}
                                  className="mr-2"
                                />
                                <span className="font-medium">{parent.name}</span>
                              </div>
                              {parent.children?.map((child) => (
                                <div key={child.value} className="flex items-center pl-6 px-2 py-1">
                                  <input
                                    type="checkbox"
                                    checked={row.entityType.includes(child.value)}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      const updatedEntityTypes = isChecked
                                        ? [...row.entityType, child.value]
                                        : row.entityType.filter((type) => type !== child.value);
                                      
                                      if (updatedEntityTypes.filter((type) => parent.children.some((child) => child.value === type)).length === parent.children.length) {
                                        updatedEntityTypes.push(parent.value);
                                      } else {
                                        updatedEntityTypes.splice(updatedEntityTypes.indexOf(parent.value), 1);
                                      }

                                      handleEntityTypeChange(rowIndex, updatedEntityTypes);
                                    }}
                                    className="mr-2"
                                  />
                                  <span>{child.name}</span>
                                </div>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Select
                      value={row.route}
                      onValueChange={(value) => handleTaskChange(rowIndex, 'route', value)}
                    >
                      <SelectTrigger className="bg-white border border-gray-300">
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent className='bg-white'>
                        <SelectItem value="image_verification">Image Verification</SelectItem>
                        <SelectItem value="document_scan">Document Scan</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  {columns.filter(col => col.visible && col.type).map((column) => (
                    <td key={column.name} className="p-2">
                      <div className="flex flex-col space-y-2">
                        {renderCellInput(row, rowIndex, column, handleTaskChange)}
                        {column.type && !row.cellConfigs?.[column.name] &&
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-dashed border-[#4285F4] text-[#4285F4] hover:bg-[#EAF2FF]"
                          onClick={() => openFieldTypeDialog(rowIndex, column.name)}
                        >
                          Set Field Type
                        </Button>
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <Button
            variant="ghost"
            className="flex items-center gap-2 text-[#4285F4] hover:bg-[#EAF2FF]"
            onClick={handleAddTaskRow}
          >
            <span className="mr-2">+</span>
            Add Row
          </Button>
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
                  onCheckedChange={(checked) => {
                    const newColumns = [...columns];
                    newColumns[index] = { ...column, visible: checked as boolean };
                    setColumns(newColumns);
                  }}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Input
                placeholder="New column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <div className="space-y-2">
                <div className="flex space-x-2">
                </div>
                <div className="space-y-1">
                  {newColumnOptions.map((option, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{option}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewColumnOptions(newColumnOptions.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
        
              <Button onClick={addCustomColumn}>Add Custom Column</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <FieldTypeDialog
        open={isFieldTypeDialogOpen}
        onOpenChange={setIsFieldTypeDialogOpen}
        columnName={editingCell?.columnName || ''}
        onSave={handleCellConfigSave}
        initialConfig={editingCell ? taskRows[editingCell.rowIndex].cellConfigs?.[editingCell.columnName] : undefined}
      />
    </div>
  )
}

function renderCellInput(row: TaskRow, rowIndex: number, column: Column, handleTaskChange: (rowIndex: number, columnName: string, value: any) => void) {
  const cellConfig = row.cellConfigs?.[column.name] || { type: column.type, options: column.options };
  
  const inputElement = (() => {
    switch (cellConfig.type) {
      case 'text':
        return (
          <Input 
            value={row[column.name] || ''}
            onChange={(e) => handleTaskChange(rowIndex, column.name, e.target.value)}
            className="bg-gray-50"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={row[column.name] || ''}
            onChange={(e) => handleTaskChange(rowIndex, column.name, e.target.value)}
            className="bg-gray-50"
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={row[column.name] || false}
            onCheckedChange={(checked) => handleTaskChange(rowIndex, column.name, checked)}
            className="border-2 border-gray-300 rounded-sm"
          />
        );
      case 'select':
      case 'multi-select':
        return (
          <Select
            value={row[column.name] || ''}
            onValueChange={(value) => handleTaskChange(rowIndex, column.name, value)}
          >
            <SelectTrigger className="bg-white border border-gray-300">
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
}

