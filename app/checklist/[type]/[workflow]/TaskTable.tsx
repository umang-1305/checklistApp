import React, { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/components/ui/card";
import Combobox from "@/app/components/ui/combo-box";
import { Info, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomCellDialog } from "./CustomCellDialog";

interface TaskRow {
  id: string;
  taskNumber: string;
  taskName: string;
  actions: string[]; 
  remark: boolean;
  entityType: string[];
  entityObject: string[];
  route: string;
  customCells?: CustomCell[];
  [key: string]: any;
}


interface CustomCell {
  tag: string;
  type: string;
  value: any;
}

interface EntityType {
  name: string;
  value: string;
  children?: EntityType[];
}

interface MainActorRow {
  actions: string;
  mainActor: string;
  team: string;
  designation: string;
  id: string;
  person: string;
}

interface TaskTableProps {
  taskRows: TaskRow[];
  handleTaskRowsChange: (updatedRows: TaskRow[]) => void;
  mainActorRows: MainActorRow[];
  entityTypes: EntityType[];
  handleTaskChange: (
    rowIndex: number,
    field: keyof TaskRow | string,
    value: any
  ) => void;
  handleEntitySelection: (
    rowIndex: number,
    field: "entityType" | "entityObject",
    updatedValues: string[]
  ) => void;
  handleAddTaskRow: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  taskRows,
  handleTaskRowsChange,
  mainActorRows,
  entityTypes,
  handleTaskChange,
  handleEntitySelection,
  handleAddTaskRow,
}) => {
  const [isCustomCellDialogOpen, setIsCustomCellDialogOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingCellIndex, setEditingCellIndex] = useState<number | null>(null);

  const openCustomCellDialog = (rowIndex: number, cellIndex: number) => {
    setEditingRowIndex(rowIndex);
    setEditingCellIndex(cellIndex);
    setIsCustomCellDialogOpen(true);
  };

  const handleSaveCustomCell = (tag: string, type: string) => {
    if (editingRowIndex !== null && editingCellIndex !== null) {
      const updatedRows = [...taskRows];
      const customCells = updatedRows[editingRowIndex].customCells!;
      customCells[editingCellIndex] = {
        ...customCells[editingCellIndex],
        tag,
        type,
      };
      handleTaskRowsChange(updatedRows);
    }
  };

  // Function to add a custom cell to a row
  const handleAddCustomCell = (rowIndex: number) => {
    const newCustomCell: CustomCell = {
      tag: '',
      type: '',
      value: null,
    };
    const updatedRows = [...taskRows];
    if (!updatedRows[rowIndex].customCells) {
      updatedRows[rowIndex].customCells = [];
    }
    updatedRows[rowIndex].customCells!.push(newCustomCell);
    handleTaskRowsChange(updatedRows);
    // Open dialog to set tag and type
    openCustomCellDialog(rowIndex, updatedRows[rowIndex].customCells!.length - 1);
  };

  // Function to handle changes in custom cells
  const handleCustomCellChange = (
    rowIndex: number,
    cellIndex: number,
    field: keyof CustomCell,
    value: any
  ) => {
    const updatedRows = [...taskRows];
    const customCells = updatedRows[rowIndex].customCells!;
    customCells[cellIndex] = {
      ...customCells[cellIndex],
      [field]: value,
    };
    handleTaskRowsChange(updatedRows);
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-start text-sm">
            <div>
              <p className="text-gray-500 mb-1 text-lg">
                The below columns are{" "}
                <span className="font-bold text-black">designed for you</span> to{" "}
                <span className="font-bold text-black">
                  decide what aspects you want your team to include
                </span>{" "}
                while carrying out their work.
              </p>
              <p className="text-gray-500 mb-1 text-lg">
                <span className="font-bold text-black">Unattended Column</span>{" "}
                means that it will not be shown in the application.
              </p>
            </div>
          </div>

          <div className="border p-3 rounded-xl">
            <table className="w-full border-separate [border-spacing:0.75rem] ">
              <thead>
                <tr className="gap-x-10">
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    <div className="flex items-center justify-between">
                      Task Number
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Information about Task Number</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    Task Name
                  </th>
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    Actions
                  </th>
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    Remark
                  </th>
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    Entity Type
                  </th>
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    Entity Object
                  </th>
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    Route
                  </th>
                  {/* Add a header for the Actions column */}
                  <th className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg ">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {taskRows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Task Number */}
                    <td className="p-2 text-center font-medium">
                      <div className="bg-[#EAF2FF] p-2 rounded text-[#4285F4]">
                        {row.taskNumber}
                      </div>
                    </td>

                    {/* Task Name */}
                    <td className="p-2">
                      <Input
                        placeholder="Enter Task name"
                        value={row.taskName}
                        onChange={(e) =>
                          handleTaskChange(rowIndex, "taskName", e.target.value)
                        }
                        className="w-full bg-gray-50 text-gray-500 rounded-md"
                      />
                    </td>

                    {/* Actions */}
                    <td className="p-2">
  <Combobox
    value={row.actions} // Pass the current array of selected actions
    onSelect={(updatedActions) =>
      handleTaskChange(rowIndex, "actions", updatedActions) // Update actions array
    }
    options={mainActorRows.map((actor) => ({
      value: actor.actions,
      label: actor.actions,
    }))}
    placeholder="Select actions"
    searchPlaceholder="Search actions..."
  />
</td>


                    {/* Remark */}
                    <td className="p-2 flex flex-row gap-x-2 items-center justify-center mt-4">
                      <Checkbox
                        checked={row.remark || false}
                        onCheckedChange={(checked) =>
                          handleTaskChange(rowIndex, "remark", checked)
                        }
                        className="border border-gray-300 rounded-md"
                      />
                      <p className="text-sm">Show remark</p>
                    </td>

                    {/* Entity Type */}
                    <td className="p-2">
                      <Combobox
                        value={row.entityType[0] || null}
                        onSelect={(value) =>
                          handleEntitySelection(
                            rowIndex,
                            "entityType",
                            value ? [value] : []
                          )
                        }
                        options={entityTypes.map((type) => ({
                          value: type.value,
                          label: type.name,
                        }))}
                        placeholder="Select Entity Type"
                        searchPlaceholder="Search entity types..."
                      />
                    </td>

                    {/* Entity Object */}
                    <td className="p-2">
                      <Combobox
                        value={row.entityObject[0] || null}
                        onSelect={(value) =>
                          handleEntitySelection(
                            rowIndex,
                            "entityObject",
                            value ? [value] : []
                          )
                        }
                        options={
                          entityTypes
                            .find((type) => type.value === row.entityType[0])
                            ?.children?.map((obj) => ({
                              value: obj.value,
                              label: obj.name,
                            })) || []
                        }
                        placeholder="Select Entity Object"
                        searchPlaceholder="Search entity objects..."
                        disabled={!row.entityType.length}
                      />
                    </td>

                    {/* Route */}
                    <td className="p-2">
                      <Combobox
                        value={row.route}
                        onSelect={(value) =>
                          handleTaskChange(rowIndex, "route", value)
                        }
                        options={[
                          { value: "/ocr", label: "Machine Values" },
                          { value: "/image", label: "Hygine Check" },
                        ]}
                        placeholder="Select route"
                        searchPlaceholder="Search routes..."
                      />
                    </td>

                    {/* Render custom cells for this row */}
                    {row.customCells &&
                      row.customCells.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          {/* Render the custom cell */}
                          {renderCustomCell(
                            rowIndex,
                            cellIndex,
                            cell,
                            handleCustomCellChange,
                            openCustomCellDialog
                          )}
                        </td>
                      ))}

                    {/* Plus sign to add custom cell */}
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddCustomCell(rowIndex)}
                      >
                        <Plus className="h-5 w-5 text-[#4285F4]" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-base p-6 text-[#4285F4] bg-[#EAF2FF] hover:bg-[#D3E3FF] rounded-lg"
            onClick={handleAddTaskRow}
          >
            <span className="mr-2">+</span>
            Add Row
          </Button>
        </div>
      </Card>

      <CustomCellDialog
        isOpen={isCustomCellDialogOpen}
        onClose={() => setIsCustomCellDialogOpen(false)}
        onSave={handleSaveCustomCell}
      />
    </>
  );
};

function renderCustomCell(
  rowIndex: number,
  cellIndex: number,
  cell: CustomCell,
  handleCustomCellChange: (
    rowIndex: number,
    cellIndex: number,
    field: keyof CustomCell,
    value: any
  ) => void,
  openCustomCellDialog: (rowIndex: number, cellIndex: number) => void
) {
  // If tag and type are not set yet, prompt user to set them
  if (!cell.tag || !cell.type) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => openCustomCellDialog(rowIndex, cellIndex)}
      >
        Set Tag and Type
      </Button>
    );
  }

  // Render the input based on cell type
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {cell.tag}
      </label>
      {(() => {
        switch (cell.type) {
          case 'text':
            return (
              <Input
                placeholder={cell.tag}
                value={cell.value || ''}
                onChange={(e) =>
                  handleCustomCellChange(rowIndex, cellIndex, 'value', e.target.value)
                }
                className="bg-gray-50"
              />
            );
          case 'number':
            return (
              <Input
                type="number"
                placeholder={cell.tag}
                value={cell.value || ''}
                onChange={(e) =>
                  handleCustomCellChange(rowIndex, cellIndex, 'value', e.target.value)
                }
                className="bg-gray-50"
              />
            );
          case 'checkbox':
            return (
              <div className="flex items-center">
                <Checkbox
                  checked={cell.value || false}
                  onCheckedChange={(checked) =>
                    handleCustomCellChange(rowIndex, cellIndex, 'value', checked)
                  }
                  className="border-2 border-gray-300 rounded-sm"
                />
                <label className="ml-2 text-sm">{cell.tag}</label>
              </div>
            );
          // Add more cases for other types
          default:
            return null;
        }
      })()}
    </div>
  );
}
