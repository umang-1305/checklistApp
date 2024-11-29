'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog"
import { toast } from "@/app/components/ui/use-toast"
import { fetchActors, postWorkflow } from '../utils/api'
import { exportToCSV } from '../lib/csvExport'
import { MainActorForm } from './main-actor-form'
import { CustomInput } from './custom-inputs/CustomInput'
import { MultiSelect } from './custom-inputs/MultiSelect'
import { SingleSelect } from './custom-inputs/SingleSelect'
import { CustomCheckbox } from './custom-inputs/CustomCheckbox'
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"

export type ColumnType = 'Task Number' | 'Task Name' | 'Step Name' | 'Designated Actor' | 'Remark' | string;

export interface Column {
  name: ColumnType;
  visible: boolean;
  inputType: 'text' | 'number' | 'multiSelect' | 'singleSelect' | 'checkbox' | 'custom';
  options?: string[];
  allowedInputs?: string[];
}

export interface Row {
  id: string;
  [key: string]: string | boolean | string[];
}

export default function Checklist() {
  const [columns, setColumns] = useState<Column[]>([
    { name: 'Task Number', visible: true, inputType: 'number' },
    { name: 'Task Name', visible: true, inputType: 'text' },
    { name: 'Step Name', visible: true, inputType: 'text' },
    { name: 'Designated Actor', visible: true, inputType: 'singleSelect', options: [] },
    { name: 'Remark', visible: true, inputType: 'checkbox' },
  ]);
  const [rows, setRows] = useState<Row[]>([]);
  const [actors, setActors] = useState<string[]>([]);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newCustomColumn, setNewCustomColumn] = useState('');
  const [newColumnType, setNewColumnType] = useState<Column['inputType']>('text');
  const [newColumnOptions, setNewColumnOptions] = useState<string[]>([]);
  const [newColumnAllowedInputs, setNewColumnAllowedInputs] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const loadActors = async () => {
      try {
        const response = await fetchActors();
        if (response.status === 'success') {
          const actorNames = response.data.map((actor: any) => actor.person);
          setActors(actorNames);
          setColumns(prevColumns => 
            prevColumns.map(col => 
              col.name === 'Designated Actor' ? { ...col, options: actorNames } : col
            )
          );
        }
      } catch (error) {
        console.error('Error loading actors:', error);
        toast({
          title: "Error",
          description: "Failed to load actors from the server.",
          variant: "destructive",
        });
      }
    };

    loadActors();
  }, []);

  const handleAddRow = () => {
    const newRow: Row = {
      id: String(rows.length + 1),
      'Task Number': String(rows.length + 1),
      'Task Name': '',
      'Step Name': '',
      'Designated Actor': '',
      'Remark': false,
    };
    setRows([...rows, newRow]);
  };

  const handleCellChange = (rowIndex: number, columnName: string, value: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnName]: value };
    setRows(newRows);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const workflowData = {
        name: "Creating EC Pellets",
        "step name": rows[0]['Step Name'], // Assuming all rows have the same step name
        tasks: rows.map(row => ({
          Actors: [
            {
              "Actor 1": [
                {
                  action: "signed by",
                  designation: "Supervisor",
                  name: row['Designated Actor'],
                  team: "QA Team"
                }
              ]
            }
          ],
          remark: row['Remark'],
          "task-name": row['Task Name'],
          "task-number": row['Task Number']
        }))
      };

      console.log('Sending data to backend:', JSON.stringify(workflowData, null, 2));

      const response = await postWorkflow(workflowData);
      console.log('Response from backend:', response);

      if (response.status === 'success') {
        toast({
          title: "Changes Published",
          description: "Your changes have been successfully saved to the server.",
        });
        setIsPublishDialogOpen(false);
      } else {
        throw new Error(response.message || 'Failed to publish changes');
      }
    } catch (error) {
      console.error('Error publishing changes:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error saving your changes to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newRows = Array.from(rows);
    const [reorderedRow] = newRows.splice(result.source.index, 1);
    newRows.splice(result.destination.index, 0, reorderedRow);

    // Update task numbers
    newRows.forEach((row, index) => {
      row['Task Number'] = String(index + 1);
    });

    setRows(newRows);
  };

  const handleColumnToggle = (columnName: ColumnType) => {
    setColumns(columns.map(col =>
      col.name === columnName ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleAddCustomColumn = () => {
    if (newCustomColumn) {
      setColumns([...columns, { 
        name: newCustomColumn, 
        visible: true, 
        inputType: newColumnType,
        ...(newColumnType === 'multiSelect' || newColumnType === 'singleSelect' ? { options: newColumnOptions } : {}),
        ...(newColumnType === 'custom' ? { allowedInputs: newColumnAllowedInputs } : {})
      }]);
      setNewCustomColumn('');
      setNewColumnType('text');
      setNewColumnOptions([]);
      setNewColumnAllowedInputs([]);
    }
  };

  const renderCell = (row: Row, column: Column, rowIndex: number) => {
    switch (column.inputType) {
      case 'text':
      case 'number':
        return (
          <Input
            type={column.inputType}
            value={row[column.name] as string}
            onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
          />
        );
      case 'multiSelect':
        return (
          <MultiSelect
            options={column.options || []}
            value={row[column.name] as string[]}
            onChange={(value) => handleCellChange(rowIndex, column.name, value)}
          />
        );
      case 'singleSelect':
        return (
          <SingleSelect
            options={column.options || []}
            value={row[column.name] as string}
            onChange={(value) => handleCellChange(rowIndex, column.name, value)}
          />
        );
      case 'checkbox':
        return (
          <CustomCheckbox
            checked={row[column.name] as boolean}
            onCheckedChange={(checked) => handleCellChange(rowIndex, column.name, checked)}
            label={(checked) => checked ? "Yes" : "No"}
          />
        );
      case 'custom':
        return (
          <CustomInput
            value={row[column.name] as string}
            onChange={(value) => handleCellChange(rowIndex, column.name, value)}
            allowedInputs={column.allowedInputs || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Checklist Module</h1>
        <div>
          <Button onClick={() => setIsColumnDialogOpen(true)} className="mr-2">Configure Columns</Button>
          <Button onClick={() => exportToCSV(columns, rows)} className="mr-2">Export CSV</Button>
          <AlertDialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button>Publish changes</Button>
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
                <AlertDialogAction onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="rows" type="row">
          {(provided) => (
            <table className="w-full border-collapse" {...provided.droppableProps} ref={provided.innerRef}>
              <thead>
                <tr>
                  {columns.filter(col => col.visible).map((column) => (
                    <th key={column.name} className="border p-2">
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <Draggable key={row.id} draggableId={row.id} index={rowIndex}>
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {columns.filter(col => col.visible).map((column) => (
                          <td key={column.name} className="border p-2">
                            {renderCell(row, column, rowIndex)}
                          </td>
                        ))}
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>

      <Button onClick={handleAddRow} className="mt-4">Add Row</Button>

      <MainActorForm />

      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent>
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
                placeholder="New custom column"
                value={newCustomColumn}
                onChange={(e) => setNewCustomColumn(e.target.value)}
              />
              <Select value={newColumnType} onValueChange={setNewColumnType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select input type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="multiSelect">Multi Select</SelectItem>
                  <SelectItem value="singleSelect">Single Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {(newColumnType === 'multiSelect' || newColumnType === 'singleSelect') && (
                <Input
                  placeholder="Options (comma-separated)"
                  onChange={(e) => setNewColumnOptions(e.target.value.split(',').map(o => o.trim()))}
                />
              )}
              {newColumnType === 'custom' && (
                <Input
                  placeholder="Allowed inputs (comma-separated)"
                  onChange={(e) => setNewColumnAllowedInputs(e.target.value.split(',').map(o => o.trim()))}
                />
              )}
              <Button onClick={handleAddCustomColumn}>Add Column</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

