import React from "react";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/components/ui/card";
import Combobox from "@/app/components/ui/combo-box";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskRow {
  id: string;
  taskNumber: string;
  taskName: string;
  actions: string;
  remark: boolean;
  entityType: string[]; // Always an array
  entityObject: string[]; // Always an array
  route: string;
  cellConfigs?: { [key: string]: CellConfig };
  [key: string]: any;
}

interface Column {
  name: string;
  visible: boolean;
  type?: string;
  options?: string[];
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

interface CellConfig {
  type: string;
  options?: string[];
}

interface TaskTableProps {
  taskRows: TaskRow[];
  columns: Column[];
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
  setIsColumnDialogOpen: (open: boolean) => void;
  openFieldTypeDialog: (rowIndex: number, columnName: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  taskRows,
  columns,
  mainActorRows,
  entityTypes,
  handleTaskChange,
  handleEntitySelection,
  handleAddTaskRow,
  setIsColumnDialogOpen,
  openFieldTypeDialog,
}) => {
  return (
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
          <Button
            variant="outline"
            className="bg-[#EAF2FF] text-[#4285F4] hover:bg-[#D3E3FF] rounded-md transition-colors duration-200 text-lg font-light"
            onClick={() => {
              setIsColumnDialogOpen(true);
            }}
          >
            Configure Columns
          </Button>
        </div>

        <div className="border p-3 rounded-xl">
          <table className="w-full border-separate [border-spacing:0.75rem] ">
            <thead>
              <tr className="gap-x-10">
                {columns
                  .filter((col) => col.visible)
                  .map((column) => (
                    <th
                      key={column.name}
                      className="p-2 font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg "
                    >
                      <div className="flex items-center justify-between">
                        {column.name}
                        {column.name !== "Task Number" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{`Information about ${column.name}`}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </th>
                  ))}
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
                      value={row.actions}
                      onSelect={(value) =>
                        handleTaskChange(rowIndex, "actions", value)
                      }
                      options={mainActorRows.map((actor) => ({
                        value: actor.actions,
                        label: actor.actions,
                      }))}
                      placeholder="Select action"
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
                        { value: "/image", label: "Image Verification" },
                        { value: "/invoice", label: "Document Scan" },
                      ]}
                      placeholder="Select route"
                      searchPlaceholder="Search routes..."
                    />
                  </td>

                  {/* Custom Columns */}
                  {columns
                    .filter((col) => col.visible && col.name !== "Task Number" && col.name !== "Task Name" && col.name !== "Actions" && col.name !== "Remark" && col.name !== "Entity Type" && col.name !== "Entity Object" && col.name !== "Route")
                    .map((column) => {
                      // Define cellConfig here
                      const cellConfig =
                        row.cellConfigs?.[column.name] || {};

                      return (
                        <td key={column.name} className="p-2">
                          <div className="flex flex-col space-y-2">
                            {renderCellInput(
                              row,
                              rowIndex,
                              column,
                              handleTaskChange
                            )}

                            {!cellConfig.type && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-dashed border-[#4285F4] text-[#4285F4] hover:bg-[#EAF2FF]"
                                onClick={() =>
                                  openFieldTypeDialog(rowIndex, column.name)
                                }
                              >
                                Set Field Type
                              </Button>
                            )}
                          </div>
                        </td>
                      );
                    })}
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
  );
};

function renderCellInput(
  row: TaskRow,
  rowIndex: number,
  column: Column,
  handleTaskChange: (
    rowIndex: number,
    field: keyof TaskRow | string,
    value: any
  ) => void
) {
  const cellConfig =
    row.cellConfigs?.[column.name] || {
      type: column.type,
      options: column.options,
    };
  if (!cellConfig.type) return null;
  switch (cellConfig.type) {
    case "text":
      return (
        <Input
          value={row[column.name] || ""}
          onChange={(e) =>
            handleTaskChange(rowIndex, column.name, e.target.value)
          }
          className="bg-gray-50"
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={row[column.name] || ""}
          onChange={(e) =>
            handleTaskChange(rowIndex, column.name, e.target.value)
          }
          className="bg-gray-50"
        />
      );
    case "checkbox":
      return (
        <Checkbox
          checked={row[column.name] || false}
          onCheckedChange={(checked) =>
            handleTaskChange(rowIndex, column.name, checked)
          }
          className="border-2 border-gray-300 rounded-sm"
        />
      );
    case "select":
      return (
        <Combobox
          value={row[column.name] || null}
          onSelect={(value) =>
            handleTaskChange(rowIndex, column.name, value)
          }
          options={(cellConfig.options || []).map((option) => ({
            value: option,
            label: option,
          }))}
          placeholder={`Select ${column.name}`}
          searchPlaceholder={`Search ${column.name.toLowerCase()}...`}
        />
      );
    case "multi-select":
      return (
        <Combobox
          value={row[column.name] || []}
          onSelect={(value) =>
            handleTaskChange(rowIndex, column.name, value)
          }
          options={(cellConfig.options || []).map((option) => ({
            value: option,
            label: option,
          }))}
          placeholder={`Select ${column.name}`}
          searchPlaceholder={`Search ${column.name.toLowerCase()}...`}
          isMulti
        />
      );
    default:
      return null;
  }
}
