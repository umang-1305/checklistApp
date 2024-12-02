import React from "react";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TaskRow {
  id: string;
  taskNumber: string;
  taskName: string;
  actions: string;
  remark: boolean;
  entityType: string[]; // Always an array
  entityObject: string[]; // Always an array
  route: string;
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
}

export const TaskTable: React.FC<TaskTableProps> = ({
  taskRows,
  columns,
  mainActorRows,
  entityTypes,
  handleTaskChange,
  handleEntitySelection,
  handleAddTaskRow,
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
          >
            Configure Columns
          </Button>
        </div>

        <div className="overflow-x-auto border p-3 rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {columns
                  .filter((col) => col.visible)
                  .map((column) => (
                    <th
                      key={column.name}
                      className="p-3 text-left font-medium bg-[#EAF2FF] text-[#4285F4] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {column.name}
                        {column.name !== "Task Number" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 " />
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
                    <Select
                      value={row.actions}
                      onValueChange={(value) =>
                        handleTaskChange(rowIndex, "actions", value)
                      }
                    >
                      <SelectTrigger className="w-full border border-gray-300 rounded-md">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainActorRows.map((actor, index) => (
                          <SelectItem key={index} value={actor.actions}>
                            {actor.actions}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Remark */}
                  <td className="p-2">
                    <Checkbox
                      checked={row.remark || false}
                      onCheckedChange={(checked) =>
                        handleTaskChange(rowIndex, "remark", checked)
                      }
                      className="border border-gray-300 rounded-md"
                    />
                  </td>

                  {/* Entity Type */}
                  <td className="p-2">
                    <Select
                      value={row.entityType[0] || ""}
                      onValueChange={(value) =>
                        handleEntitySelection(rowIndex, "entityType", [value])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Entity Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {entityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Entity Object */}
                  <td className="p-2">
                    <Select
                      value={row.entityObject[0] || ""}
                      onValueChange={(value) =>
                        handleEntitySelection(rowIndex, "entityObject", [value])
                      }
                      disabled={!row.entityType.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Entity Object" />
                      </SelectTrigger>
                      <SelectContent>
                        {entityTypes
                          .find((type) => type.value === row.entityType[0])
                          ?.children?.map((obj) => (
                            <SelectItem key={obj.value} value={obj.value}>
                              {obj.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Route */}
                  <td className="p-2">
  <select
    value={row.route}
    onChange={(e) => handleTaskChange(rowIndex, "route", e.target.value)}
    className="w-full bg-gray-50 text-gray-500 rounded-md"
  >
    <option value="">Select Route</option>
    <option value="/image">Image Verification</option>
    <option value="/invoice">Document Scan</option>
  </select>
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
  );
};
