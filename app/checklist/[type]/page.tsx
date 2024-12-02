'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { MultiSelectPreview } from '@/app/components/ui/multi-select-preview'
import { Separator } from "@/components/ui/separator"
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Info, Trash2, Settings, Plus } from 'lucide-react'
import { FieldTypeDialog } from '../../components/field-type-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from "@/app/components/ui/use-toast"


interface MainActorRow {
  actions: string;
  mainActor: string;
  team: string;
  designation: string;
  id: string;
  person: string;
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
  entityObject: string[];
  entityType: string[];
  route: string;
  [key: string]: any; // For custom columns
  cellConfigs?: { [key: string]: CellConfig };
}

interface WorkflowData {
  id: string;
  [key: string]: any;
}

interface ChecklistProps {
  params: Promise<{
    type: string;
  }>;
}

interface ActorData {
  Designated_Actor: string;
  field: string;
  designation: string;
  id: string;
  person: string;
}

interface EntityData {
  [key: string]: {
    ID?: string;
    Name: string;
    Type?: string;
  };
}

interface Column {
  name: string;
  visible: boolean;
  type?: string;
  options?: string[];
}

interface EditingCell {
  rowIndex: number;
  columnName: string;
}

export default function Checklist({ params }: ChecklistProps) {
  const [type, setType] = useState<string>("");
  const [mainActorRows, setMainActorRows] = useState<MainActorRow[]>([{
    actions: '',
    mainActor: '',
    team: '',
    designation: '',
    id: '',
    person: ''
  }]);

  const [taskRows, setTaskRows] = useState<TaskRow[]>([{
    id: '1',
    taskNumber: '01.',
    taskName: '',
    actions: '',
    remark: false,
    entityType: [],
    entityObject: [],
    route: ''
  }]);

  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { name: 'Task Number', visible: true },
    { name: 'Task Name', visible: true },
    { name: 'Actions', visible: true },
    { name: 'Remark', visible: true },
    { name: 'Entity Type', visible: true },
    { name: 'Entity Object', visible:true},
    { name: 'Route', visible: true },

  ]);

  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('blank');
  const [newColumnOptions, setNewColumnOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [isFieldTypeDialogOpen, setIsFieldTypeDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [newColumnFieldType, setNewColumnFieldType] = useState<string>('');
  const [newColumnFieldOptions, setNewColumnFieldOptions] = useState<string[]>([]);

  const [actorData, setActorData] = useState<ActorData[]>([]);
  const [entityData, setEntityData] = useState<EntityData>({});
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        const response = await fetch('https://admin-backend-vj3t6ewmoa-uc.a.run.app/Actors');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'success') {
          setActorData(data.data);
        } else {
          console.error('Failed to fetch actor data');
        }
      } catch (error) {
        console.error('Error fetching actor data:', error);
      }
    };

    fetchActorData();
    console.log('Actor data:', actorData);
  }, []);

  useEffect(() => {
    const fetchEntityData = async () => {
      try {
        const response = await fetch('https://admin-backend-85801868683.us-central1.run.app/Workflows/Workflow14/entity/step1');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
  
        if (data.status === 'success' && data.data.entities?.equipment) {
          // Extract and map `equipment` data
          const equipmentData = data.data.entities.equipment;
          const mappedEntityTypes = Object.keys(equipmentData).map((key) => ({
            name: equipmentData[key].name,
            value: key.toLowerCase() // Assuming you want keys like `RMG_1` as values
          }));
          setEntityData(mappedEntityTypes);
        } else {
          console.error('Failed to fetch or parse entity data');
        }
      } catch (error) {
        console.error('Error fetching entity data:', error);
      }
    };
  
    fetchEntityData();
  }, []);
  

  useEffect(() => {
    const fetchData = async () => {
      if (!type) return;

      const stepMapping = {
        'MEQ': 'step1',
        'DRM': 'step2',
        'RMQ': 'step3'
      };

      const step = stepMapping[type.toUpperCase()] || 'step1';

      try {
        const [workflowResponse, entityResponse] = await Promise.all([
          fetch('https://admin-backend-vj3t6ewmoa-uc.a.run.app/Workflows/Workflow14'),
          fetch(`https://admin-backend-85801868683.us-central1.run.app/Workflows/Workflow14/entity/step1`)
        ]);

        if (!workflowResponse.ok || !entityResponse.ok) {
          throw new Error(`HTTP error! status: ${workflowResponse.status} ${entityResponse.status}`);
        }

        const workflowData = await workflowResponse.json();
        const entityData = await entityResponse.json();

        if (workflowData.status === 'success' && entityData.status === 'success') {
          setWorkflowData(workflowData.data);
          setEntityData(entityData.data.entities);
          populateFields(workflowData.data, entityData.data.entities);
        } else {
          console.error('Failed to fetch workflow or entity data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [type]);

  const populateFields = (workflowData: WorkflowData, entityData: any) => {
    if (!workflowData || !entityData) return;

    const stepKey = `step${workflowData.stepOrder}`;
    const step = workflowData[stepKey];
    if (!step) return;

    // Populate main actor rows
    const actorRows = Object.entries(step.actors).map(([key, value]: [string, any]) => ({
      actions: value.action,
      mainActor: value.name,
      team: value.team,
      designation: value.designation,
      id: key,
      person: value.name
    }));
    setMainActorRows(actorRows);

    // Populate task rows
    const taskRows = Object.entries(step.tasks).map(([key, value]: [string, any], index) => ({
      id: String(index + 1),
      taskNumber: `${String(index + 1).padStart(2, '0')}.`,
      taskName: value.taskLabel,
      actions: Object.values(value.actions)[0]?.actionType || '',
      remark: value.remark.showRemark,
      entityType: Object.keys(value.entityObjects || {}),
      entityObject: Object.values(value.entityObjects || {}).map((eo: any) => eo.entityType),
      route: value.route
    }));
    setTaskRows(taskRows);

    //Update entity types
    const newEntityTypes = useMemo(() => {
      if (!entityData) return [];
    
      return Object.entries(entityData).map(([key, value]: [string, any]) => ({
        name: key,
        value: key.toLowerCase(),
        children: Object.entries(value).map(([childKey, childValue]: [string, any]) => ({
          name: childValue.name,
          value: childKey.toLowerCase(),
        })),
      }));
    }, [entityData]);
    
    setEntityTypes(newEntityTypes);
  };


  const entityTypes: EntityType[] = useMemo(() => {
    if (!entityData) return [];

    return Object.entries(entityData).map(([key, value]: [string, any]) => ({
      name: key,
      value: key.toLowerCase(),
      children: Object.entries(value).map(([childKey, childValue]: [string, any]) => ({
        name: childValue.name,
        value: childKey.toLowerCase(),
      }))
    }));
  }, [entityData]);

  const handleAddMainActorRow = () => {
    setMainActorRows([...mainActorRows, { actions: '', mainActor: '', team: '', designation: '', id: '', person: '' }]);
  };

  const handleMainActorChange = (index: number, field: keyof MainActorRow, value: string) => {
    const newRows = [...mainActorRows];
    newRows[index] = { ...newRows[index], [field]: value };

    if (field === 'mainActor') {
      const selectedActor = actorData.find(actor => actor.Designated_Actor === value);
      if (selectedActor) {
        newRows[index].team = selectedActor.field;
        newRows[index].designation = selectedActor.designation;
      }
    }

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
      entityObject: [],
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
      setColumns([...columns, newColumn]);
      setTaskRows(taskRows.map(row => ({ 
        ...row, 
        [newColumnName]: '',
        cellConfigs: {
          ...row.cellConfigs,
          [newColumnName]: { type: '' }
        }
      })));
      setNewColumnName('');
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

  const publishChanges = useCallback(async () => {
    if (!workflowData || !type) return;

    const stepMapping = {
      'MEQ': 'step1',
      'DRM': 'step2',
      'RMQ': 'step3'
    };

    const stepKey = stepMapping[type.toUpperCase()] || 'step1';
    const updatedWorkflow = { ...workflowData };

    const actors = mainActorRows.reduce((acc, actor, index) => {
      if (actor.actions && actor.mainActor) {
        acc[`actor${index + 1}`] = {
          action: actor.actions,
          date: new Date().toUTCString(),
          designation: actor.designation,
          name: actor.mainActor,
          team: actor.team
        };
      }
      return acc;
    }, {} as Record<string, any>);

    const tasks = taskRows.reduce((acc, task, index) => {
      const taskKey = `task${index + 1}`;
      const actions = mainActorRows.reduce((actionsAcc, actor, actorIndex) => {
        if (task.actions === actor.actions && actor.actions && actor.mainActor) {
          const actionKey = `action${actorIndex + 1}`;
          actionsAcc[actionKey] = {
            actionType: actor.actions,
            actor: actor.mainActor,
            isSigned: false
          };
        }
        return actionsAcc;
      }, {} as Record<string, any>);

      const entityObjects = task.entityType.reduce((entityAcc, entity, entityIndex) => {
        entityAcc[entity] = {
          entityType: task.entityObject[entityIndex] || '',
          customInput: {
            input: true,
            inputText: ""
          }
        };
        return entityAcc;
      }, {} as Record<string, any>);

      acc[taskKey] = {
        actions,
        entityObjects,
        remark: {
          input: task.remark,
          remarkText: "",
          showRemark: task.remark
        },
        route: task.route || "",
        taskLabel: task.taskName
      };

      return acc;
    }, {} as Record<string, any>);

    updatedWorkflow[stepKey] = {
      ...updatedWorkflow[stepKey],
      actors,
      tasks
    };

    try {
      const response = await fetch('https://admin-backend-85801868683.us-central1.run.app/Workflows/update/Workflow14', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflow: updatedWorkflow }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data = await response.json();
      toast({
        title: "Changes published successfully",
        description: "Your changes have been saved and published.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error publishing changes",
        description: error instanceof Error ? error.message : "There was a problem publishing your changes. Please try again.",
        variant: "destructive",
      });
    }
  }, [workflowData, mainActorRows, taskRows, type]);

  return (
    <div className="p-6 space-y-3 text-lg font-poppins">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <div className="flex items-center space-x-4">
              <Button className="bg-[#4285F4] text-white hover:bg-[#3367D6] rounded-2xl p-4 text-lg font-normal" onClick={publishChanges} size="lg">
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
        <div className="border border-input rounded-2xl p-4 space-y-4">
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
                className="bg-gray-50 text-gray-500 text-base"
              />
              <Select
                value={row.mainActor}
                onValueChange={(value) => handleMainActorChange(index, "mainActor", value)}
              >
                <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                  <SelectValue placeholder="Select Actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="realtime" value="realtime">
                    Check on Realtime
                  </SelectItem>
                  {actorData.map((actor) => (
                    <SelectItem key={actor.id} value={actor.Designated_Actor}>
                      {actor.Designated_Actor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={row.mainActor.toLowerCase() === "realtime" ? "" : row.team}
                onValueChange={(value) =>
                  handleMainActorChange(index, "team", value)
                }
                disabled={row.mainActor.toLowerCase() === "realtime"}
              >
                <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                  <SelectValue placeholder="Select the team" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(actorData.map(actor => actor.field))).map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-row gap-x-3">
              <Select
                value={row.mainActor.toLowerCase() === "realtime" ? "" : row.designation}
                onValueChange={(value) => handleMainActorChange(index, "designation", value)}
                 disabled={row.mainActor.toLowerCase() === "realtime"}
              >
                <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                  <SelectValue placeholder="Select the Designation" />
                </SelectTrigger>
                <SelectContent>
                   {Array.from(new Set(actorData.map(actor => actor.designation))).map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                  onClick={() => handleDelete()}
                  variant="outline"
                  size="icon"
                  className="p-2"
                >
                  <Trash2 className="h-6 w-6" />
                  <span className="sr-only">Delete row</span>
                </Button>
                </div>
            </div>
          ))}
          <Button
          variant="ghost"
          className="flex items-center gap-2 text-base p-6 text-[#4285F4] hover:text-[#4285F4] bg-[#EAF2FF] hover:bg-[#EAF2FF]/60 mt-5"
          onClick={handleAddMainActorRow}
        >
          <span className="mr-2">+</span>
          Add Row
        </Button>
        </div>
        <div className="flex justify-end">
          <Button className=" bg-[#4285F4] text-white hover:bg-[#3367D6] text-lg rounded-xl" size="lg">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>

  <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start text-sm">
          <div className="">
             <p className="text-gray-500 mb-1 text-lg">
              The below columns are <span className="font-bold text-black">designed for you</span> to <span className="font-bold text-black">decide what aspects you want your team to include</span> while carrying out their work.
            </p>
            <p className="text-gray-500 mb-1 text-lg">
              <span className="font-bold text-black">Unattended Column</span> means that it will not be shown in the application.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="bg-[#EAF2FF] text-[#4285F4] hover:bg-[#D3E3FF] rounded-md transition-colors duration-200 text-lg font-light"
            onClick={() => setIsColumnDialogOpen(true)}
            size="lg"
          >
            Configure Columns
          </Button>
        </div>

        <div className="overflow-x-auto border p-3 rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="">
                {columns.filter(col => col.visible).map((column) => (
                  <th key={column.name} className={`p-3 text-left font-medium ${column.name === 'Task Number' ? 'w-44' : ''}`}>
                    <div className={`flex items-center justify-between gap-3 bg-[#EAF2FF] text-[#4285F4] p-3 rounded-2xl ${column.name === 'Task Number' ? '' : 'w-full'}`}>
                      {column.name}
                      {column.name !== 'Task Number' && (
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
              {taskRows.map((row, rowIndex) => {
                const associatedActor = mainActorRows.find(actor => actor.actions === row.actions);
                if (associatedActor && associatedActor.designation.toLowerCase() === 'supervisor') {
                  return null;
                }
                return (
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
                        className="bg-gray-50 text-gray-500 text-base"
                      />
                    </td>
                    <td className="p-2">
                      <Select
                        value={row.actions}
                        onValueChange={(value) => handleTaskChange(rowIndex, 'actions', value)}
                      >
                        <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          {mainActorRows
                            .filter(mainRow => mainRow.designation.toLowerCase() !== 'supervisor')
                            .map((mainRow, index) => (
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
  value={row.entityType.join(', ')}
  onValueChange={(value) =>
    handleEntityTypeChange(rowIndex, Array.isArray(value) ? value : [value])
  }
>
  <SelectTrigger className="border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white text-gray-500">
    <SelectValue placeholder="Select Entity Type">
      <MultiSelectPreview selected={row.entityType} entityTypes={entityData} />
    </SelectValue>
  </SelectTrigger>
  <SelectContent className="bg-white border border-gray-300 rounded mt-2 max-h-60 overflow-y-auto">
    {Object.entries(entityData).map(([key, value]) => (
      <div
        key={key} // Use the key as the unique identifier
        className="flex items-center px-2 py-1 hover:bg-gray-100"
      >
        <Checkbox
          checked={row.entityType.includes(key)}
          onCheckedChange={(checked) => {
            const isChecked = checked === true;
            const updatedEntityTypes = isChecked
              ? [...row.entityType, key]
              : row.entityType.filter((type) => type !== key);
            handleEntityTypeChange(rowIndex, updatedEntityTypes);
          }}
          className="mr-2"
        />
        <span className="font-medium">{value.name || key}</span> {/* Display name or key */}
      </div>
    ))}
  </SelectContent>
</Select>




                    </td>
                    <td className="p-2">
                    <Select
  value={row.entityType.join(', ')}
  onValueChange={(value) =>
    handleEntityTypeChange(rowIndex, Array.isArray(value) ? value : [value])
  }
>
  <SelectTrigger className="border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white text-gray-500">
    <SelectValue placeholder="Select Entity Type">
      <MultiSelectPreview selected={row.entityType} entityTypes={entityData} />
    </SelectValue>
  </SelectTrigger>
  <SelectContent className="bg-white border border-gray-300 rounded mt-2 max-h-60 overflow-y-auto">
    {Object.entries(entityData).map(([key, value]) => (
      <div
        key={key} // Use the key as the unique identifier
        className="flex items-center px-2 py-1 hover:bg-gray-100"
      >
        <Checkbox
          checked={row.entityType.includes(key)}
          onCheckedChange={(checked) => {
            const isChecked = checked === true;
            const updatedEntityTypes = isChecked
              ? [...row.entityType, key]
              : row.entityType.filter((type) => type !== key);
            handleEntityTypeChange(rowIndex, updatedEntityTypes);
          }}
          className="mr-2"
        />
        <span className="font-medium">{value.name || key}</span> {/* Display name or key */}
      </div>
    ))}
  </SelectContent>
</Select>

                    </td>
                    <td className="p-2">
                      <Select
                        value={row.route}
                        onValueChange={(value) => handleTaskChange(rowIndex, 'route', value)}
                      >
                        <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          <SelectItem value="/image">Image Verification</SelectItem>
                          <SelectItem value="/invoice">Document Scan</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    {columns.filter(col => col.visible && col.type).map((column) => (
                      <td key={column.name} className="p-2">
                        <div className="flex flex-col space-y-2">
                          {renderCellInput(row, rowIndex, column, handleTaskChange, openFieldTypeDialog)}
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
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
      <DialogContent className="max-w-md p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Configure Columns</h2>
        </div>
        
        <div className="p-4 space-y-4">
          {columns.map((column, index) => (
            <div key={index} className="flex items-center gap-3">
              <Info className="w-4 h-4 text-gray-400" />
              <span className="flex-grow text-base">{column.name}</span>
              <Checkbox
                checked={column.visible}
                onCheckedChange={(checked) => {
                  const newColumns = [...columns]
                  newColumns[index] = { ...column, visible: checked as boolean }
                  setColumns(newColumns)
                }}
                className="rounded-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
            </div>
          ))}
          <div className="pt-2">
              <Input
                placeholder="New column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="focus:border-[#4285F4] transition-colors duration-200 text-base "
              />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white ml-auto"
              onClick={addCustomColumn}
            >
              Add Custom Column
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <Button 
            variant="ghost" 
            onClick={() => setIsColumnDialogOpen(false)}
            className="text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            Discard
          </Button>
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

function renderCellInput(row: TaskRow, rowIndex: number, column: Column, handleTaskChange: (rowIndex: number, columnName: string, value: any) => void, openFieldTypeDialog: (rowIndex:number, columnName: string) => void) {
  const cellConfig = row.cellConfigs?.[column.name] || { type: column.type, options: column.options };
  if(cellConfig.type === 'blank') {
    return null;
  }
  const inputElement = (() => {
    switch (cellConfig.type) {
      case 'text':
        return (
          <Input 
            value={row[column.name] || ''}
            onChange={(e) => handleTaskChange(rowIndex, column.name, e.target.value)}
            className="bg-gray-100 text-gray-500 text-lg"
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
        return (
          <Select
            value={row[column.name] || ''}
            onValueChange={(value) => handleTaskChange(rowIndex, column.name, value)}
          >
            <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
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
        return (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed border-[#4285F4] text-[#4285F4] hover:bg-[#EAF2FF]"
            onClick={() => openFieldTypeDialog(rowIndex, column.name)}
          >
            Set Field Type
          </Button>
        );
    }
  })();

  return (
    <div className="flex flex-col space-y-2">
      {inputElement}
    </div>
  );
}

