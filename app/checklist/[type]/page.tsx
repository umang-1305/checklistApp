'use client'

import React, { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Info, Trash2 , Settings, Plus} from 'lucide-react'
import { FieldTypeDialog } from '../../components/field-type-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'

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
   const [type, setType] = useState<string>('');

   useEffect(() => {
     if (params.type) {
       setType(params.type);
     }
   }, [params]);

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

  const handleDelete = () => {
    setMainActorRows(mainActorRows.slice(0, -1));
  }

   const title = type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Checklist` : 'Checklist & Sign'

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <div className="flex items-center space-x-4">
              <Button className="bg-[#4285F4] text-white hover:bg-[#3367D6] rounded-lg ">
                Publish changes
              </Button>
              <Avatar>
                <AvatarFallback className="bg-[#FFA4E8]">L</AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>

     <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <div className="border border-input rounded-md p-4 space-y-4">
        <div className="grid grid-cols-4 gap-4 pb-2">
          <div className="font-medium">Actions</div>
          <div className="font-medium">Main Actor</div>
          <div className="font-medium">Team</div>
          <div className="font-medium">Designation</div>
        </div>
        <Separator className="my-4" />
          {mainActorRows.map((row, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center">
              <Input
                placeholder="Enter your Action"
                value={row.actions}
                onChange={(e) =>
                  handleMainActorChange(index, "actions", e.target.value)
                }
                className="bg-muted"
              />
              <Select
                value={row.mainActor}
                onValueChange={(value) =>
                  handleMainActorChange(index, "mainActor", value)
                }
              >
                <SelectTrigger className="bg-background border border-input">
                  <SelectValue placeholder="Select Actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Check on Realtime</SelectItem>
                  <SelectItem value="john">John</SelectItem>
                  <SelectItem value="david">David</SelectItem>
                  <SelectItem value="joe">Joe</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={row.mainActor === "realtime" ? "" : row.team}
                onValueChange={(value) =>
                  handleMainActorChange(index, "team", value)
                }
                disabled={row.mainActor === "realtime"}
              >
                <SelectTrigger
                  className={`bg-background border border-input ${
                    row.mainActor === "realtime"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select the team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="qc">QC</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Select
                  value={row.mainActor === "realtime" ? "" : row.designation}
                  onValueChange={(value) =>
                    handleMainActorChange(index, "designation", value)
                  }
                  disabled={row.mainActor === "realtime"}
                >
                  <SelectTrigger
                    className={`bg-background border border-input ${
                      row.mainActor === "realtime"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select the Designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="deputy">Deputy Manager</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleDelete(index)}
                  variant="ghost"
                  size="icon"
                  className="p-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete row</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-base p-6 text-[#4285F4] bg-[#EAF2FF] hover:bg-[#EAF2FF]"
          onClick={handleAddMainActorRow}
        >
          <span className="mr-2">+</span>
          Add Row
        </Button>
        <div className="flex justify-end">
          <Button className=" bg-[#4285F4] text-white hover:bg-[#3367D6] " size="lg">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>

  <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start text-sm">
          <div className="">
             <p className="text-gray-600 mb-1 text-md">
              The below columns are <span className="font-bold text-black">designed for you</span> to <span className="font-bold text-black">decide what aspects you want your team to include</span> while carrying out their work.
            </p>
            <p className="text-gray-600 mb-1 text-md">
              <span className="font-bold text-black">Unattended Column</span> means that it will not be shown in the application.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="bg-[#EAF2FF] text-[#4285F4] hover:bg-[#D3E3FF] rounded-md transition-colors duration-200"
            onClick={() => setIsColumnDialogOpen(true)}
            size="lg"
          >
            Configure Columns
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#EAF2FF] text-[#4285F4]">
                {columns.filter(col => col.visible).map((column) => (
                  <th key={column.name} className="p-3 text-left font-medium">
                    <div className="flex items-center gap-2">
                      {column.name}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{`Information about ${column.name}`}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {taskRows.map((row, rowIndex) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-2">
                    <div className="bg-[#EAF2FF] p-2 rounded text-[#4285F4] font-medium w-16 text-center w-full">
                      {row.taskNumber}
                    </div>
                  </td>
                  <td className="p-2">
                    <Input
                      placeholder="Enter Task name"
                      value={row.taskName}
                      onChange={(e) => handleTaskChange(rowIndex, 'taskName', e.target.value)}
                      className="bg-gray-50 focus:bg-white transition-colors duration-200"
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={row.actions}
                      onValueChange={(value) => handleTaskChange(rowIndex, 'actions', value)}
                    >
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-[#4285F4] transition-colors duration-200">
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
                    <div className="flex items-center justify-center border border-gray-300 rounded p-2 bg-white hover:bg-gray-50 transition-colors duration-200">
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
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-[#4285F4] transition-colors duration-200">
                        <SelectValue placeholder="Select entity type/objects" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded mt-2 max-h-60 overflow-y-auto">
                        {entityTypes.map((parent) => {
                          const allChildrenSelected = parent.children.every((child) => row.entityType.includes(child.value));
                          return (
                            <React.Fragment key={parent.value}>
                              <div className="flex items-center px-2 py-1 hover:bg-gray-100">
                                <Checkbox
                                  checked={allChildrenSelected}
                                  onCheckedChange={(checked) => {
                                    const isChecked = checked === true;
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
                                <div key={child.value} className="flex items-center pl-6 px-2 py-1 hover:bg-gray-100">
                                  <Checkbox
                                    checked={row.entityType.includes(child.value)}
                                    onCheckedChange={(checked) => {
                                      const isChecked = checked === true;
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
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-[#4285F4] transition-colors duration-200">
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
                          className="border-dashed border-[#4285F4] text-[#4285F4] hover:bg-[#EAF2FF] transition-colors duration-200"
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
        </div>

        <Button
          variant="ghost"
          className="flex items-center gap-2 text-base p-6 text-[#4285F4] bg-[#EAF2FF] hover:bg-[#EAF2FF]"
          onClick={handleAddTaskRow}
        >
          <span className="mr-2">+</span>
          Add Row
        </Button>
      </div>

      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent className="bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Configure Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {columns.map((column, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded transition-colors duration-200">
                <span>{column.name}</span>
                <Switch
                  checked={column.visible}
                  onCheckedChange={(checked) => {
                    const newColumns = [...columns];
                    newColumns[index] = { ...column, visible: checked };
                    setColumns(newColumns);
                  }}
                />
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <Input
                placeholder="New column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="focus:border-[#4285F4] transition-colors duration-200"
              />
              <div className="space-y-2">
                <div className="space-y-1">
                  {newColumnOptions.map((option, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{option}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewColumnOptions(newColumnOptions.filter((_, i) => i !== index))}
                        className="text-red-500 hover:bg-red-100 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
        
              <Button 
                onClick={addCustomColumn}
                className="w-full bg-[#4285F4] text-white hover:bg-[#3367D6] transition-colors duration-200"
              >
                Add Custom Column
              </Button>
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
    </Card>
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

