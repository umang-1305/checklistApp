// app/checklist/[type]/[workflow]/page.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { MultiSelectPreview } from '@/app/components/ui/multi-select-preview';
import { Button } from '@/app/components/ui/button';
import { Dialog } from '@/app/components/ui/dialog';
import { FieldTypeDialog } from '../../../components/field-type-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/app/components/ui/use-toast';
import { CellInput } from './CellInput';
import { TaskTable } from './TaskTable';
import { ConfigureColumnsDialog } from './ConfigureColumnsDialog';
import { MainActorSection } from './MainActorSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"

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
  // remark: boolean;
  entityType: string[]; // Now represents only entity types
  entityObject: string[]; // New field for entity objects
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

export default function Checklist() {
  // Extract route parameters using useParams
  const params = useParams();
  const { type, workflow } = params;

  // Compute 'step' based on 'type'
  const stepMapping = {
    MEQ: 'step1',
    DRM: 'step2',
    RMQ: 'step3',
  };

  const step = stepMapping[type as keyof typeof stepMapping] || 'step3';

  const [stepData, setStepData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [mainActorRows, setMainActorRows] = useState<MainActorRow[]>([]);
  const [taskRows, setTaskRows] = useState<TaskRow[]>([]);

  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("overall")
  

const [columns, setColumns] = useState<Column[]>([
  { name: 'Task Number', visible: true },
  { name: 'Task Name', visible: true },
  { name: 'Actions', visible: true },
  { name: 'Remark', visible: true },
  { name: 'Entity Type', visible: true }, // Changed
  { name: 'Entity Object', visible: true }, // New column
  { name: 'Route', visible: true },
]);


  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('blank');
  const [isFieldTypeDialogOpen, setIsFieldTypeDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const [actorData, setActorData] = useState<ActorData[]>([]);
  const [entityData, setEntityData] = useState<EntityData>({});

  // Fetching actor data when the component mounts
  useEffect(() => {
    const fetchActorData = async () => {
      try {
        const response = await fetch(
          'https://admin-backend-vj3t6ewmoa-uc.a.run.app/Actors'
        );
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
  }, []);

  // Fetching entity data when the component mounts
  useEffect(() => {
    const fetchEntityData = async () => {
      
      try {
        const response = await fetch(
          `https://admin-backend-85801868683.us-central1.run.app/Workflows/${workflow}/entity/${step}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Entity API Response:', data); // Debug log to check response structure
        console.log('Fetched Entity Data:', JSON.stringify(data, null, 2));

        if (data.status === 'success' && data.data.entities) {
          // Safely process the data
          const processedEntityData = Object.keys(data.data.entities).reduce(
            (acc, entityTypeKey) => {
              acc[entityTypeKey] = Object.entries(data.data.entities[entityTypeKey]).reduce(
                (childAcc, [entityObjectKey, entityObjectValue]) => {
                  childAcc[entityObjectKey] = {
                    name: entityObjectValue.name || '',
                    ID: entityObjectValue.ID || '',
                  };
                  return childAcc;
                },
                {}
              );
              return acc;
            },
            {}
          );
  
          setEntityData(processedEntityData); // Update the state
          console.log('Processed Entity Data:', processedEntityData); // Debug log
        } else {
          console.error('Invalid entity data structure', data);
        }
      } catch (error) {
        console.error('Error fetching entity data:', error);
      }
    };
  
    fetchEntityData();
  }, [workflow, step]);
  console.log('Workflow:', workflow, 'Step:', step);

        // Fetching workflow data based on 'step' and 'workflow' parameters
  useEffect(() => {
    if (type && workflow && step) {
      const fetchStepData = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `/api/route?step=${step}&workflow=${workflow}`
          );
          if (!response.ok)
            throw new Error(`Failed to fetch step data: ${response.status}`);
          const data = await response.json();
          setStepData(data);
        } catch (error) {
          console.error('Error fetching step data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchStepData();
    }
  }, [type, workflow, step]);

  // Update mainActorRows and taskRows when stepData changes
  useEffect(() => {
    if (stepData) {
      // Update mainActorRows
      if (stepData.actors) {
        const actorsArray = Object.values(stepData.actors).map((actor: any) => ({
          actions: actor.action || '',
          mainActor: actor.name || '',
          team: actor.team || '',
          designation: actor.designation || '',
          id: actor.id || '',
          person: actor.person || '',
        }));
        setMainActorRows(actorsArray);
      }
  
      // Update taskRows
      if (stepData.tasks) {
        const tasksArray = Object.values(stepData.tasks).map((task: any, index: number) => ({
          id: String(index + 1),
          taskNumber: `${String(index + 1).padStart(2, '0')}.`,
          taskName: task.taskLabel || '',
          actions: '',
          remark: task.remark?.input || false,
          entityType: task.entityType || [], // Default to empty array
          entityObject: task.entityObject || [], // Default to empty array
          route: task.route || '',
          cellConfigs: {},
        }));
  
        // Extract 'actions' and 'entityType' for each task
        tasksArray.forEach((taskRow, idx) => {
          const taskData = Object.values(stepData.tasks)[idx];
  
          // Handle 'actions'
          if (taskData.actions) {
            const actionValues = Object.values(taskData.actions);
            if (actionValues.length > 0) {
              taskRow.actions = actionValues[0].actionType || '';
            }
          }
  
          // Handle 'entityType'
          if (taskData.entityObjects) {
            const entityTypes = Object.values(taskData.entityObjects).map(
              (entityObj: any) => entityObj.entityType || ''
            );
            taskRow.entityType = entityTypes;
          }
        });
  
        setTaskRows(tasksArray);
      }
    }
  }, [stepData]);
  

  // Processing entity types for use in select components
  const entityTypes: EntityType[] = useMemo(() => {
    return Object.keys(entityData).map((key) => {
      const value = entityData[key];
      const children = Object.keys(value).map((childKey) => {
        const childValue = value[childKey];
        return {
          name: childValue.name || childKey,
          value: childKey,
        };
      });
  
      return {
        name: key,
        value: key,
        children: children,
      };
    });
  }, [entityData]);
  
  // Function to add a new main actor row
  const handleAddMainActorRow = () => {
    setMainActorRows([
      ...mainActorRows,
      {
        actions: '',
        mainActor: '',
        team: '',
        designation: '',
        id: '',
        person: '',
      },
    ]);
  };

  // Function to handle changes in the main actor rows
  const handleMainActorChange = (
    index: number,
    field: keyof MainActorRow,
    value: string
  ) => {
    const newRows = [...mainActorRows];
    newRows[index] = { ...newRows[index], [field]: value };

    if (field === 'mainActor') {
      const selectedActor = actorData.find(
        (actor) => actor.Designated_Actor === value
      );
      if (selectedActor) {
        newRows[index].team = selectedActor.field;
        newRows[index].designation = selectedActor.designation;
      }
    }

    setMainActorRows(newRows);
  };

  // Function to add a new task row
  const handleAddTaskRow = () => {
    const newRow: TaskRow = {
      id: String(taskRows.length + 1),
      taskNumber: `${String(taskRows.length + 1).padStart(2, '0')}.`,
      taskName: '',
      actions: '',
      remark: false,
      entityType: [], // Always initialize
      entityObject: [], // Always initialize
      route: '',
    };
    setTaskRows([...taskRows, newRow]);
  };
    

  // Function to handle changes in the task rows
  const handleTaskChange = (
    rowIndex: number,
    field: keyof TaskRow | string,
    value: any
  ) => {
    setTaskRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
      return newRows;
    });
  };

  // Function to handle changes in entity types
  const handleEntityTypeChange = (rowIndex: number, updatedEntityType: string) => {
    setTaskRows((prevRows) => {
      const newRows = [...prevRows];
      // Normalize the entityType to match keys in entityData
      const normalizedEntityType = updatedEntityType.trim();
      newRows[rowIndex].entityType = [normalizedEntityType];
      newRows[rowIndex].entityObject = [];
      return newRows;
    });
  };
  
  const handleEntitySelection = (
    rowIndex: number,
    field: 'entityType' | 'entityObject',
    updatedValues: string[]
  ) => {
    setTaskRows((prevRows) => {
      const newRows = [...prevRows];
      // Normalize values to match keys
      const normalizedValues = updatedValues.map((val) => val.trim());
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        [field]: normalizedValues,
      };
      return newRows;
    });
  };
    // Function to handle updates to taskRows
const handleTaskRowsChange = (updatedRows: TaskRow[]) => {
  setTaskRows(updatedRows);
};

  const handleEntityObjectChange = (rowIndex: number, updatedEntityObject: string) => {
    setTaskRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[rowIndex].entityObject = [updatedEntityObject]; // Single entity object
      return newRows;
    });
  };
  
  // Function to add a custom column
  const addCustomColumn = () => {
    if (newColumnName) {
      const newColumn: Column = {
        name: newColumnName,
        visible: true,
        type: newColumnType,
      };
      setColumns([...columns, newColumn]);
      setTaskRows(
        taskRows.map((row) => ({
          ...row,
          [newColumnName]: '',
          cellConfigs: {
            ...row.cellConfigs,
            [newColumnName]: { type: '' },
          },
        }))
      );
      setNewColumnName('');
    }
  };
   
  // Function to open the field type dialog
  const openFieldTypeDialog = (rowIndex: number, columnName: string) => {
    console.log(rowIndex,columnName, 'hit')
    setEditingCell({ rowIndex, columnName });
    setIsFieldTypeDialogOpen(true);
  };

  // Function to save cell configuration
  const handleCellConfigSave = (config: CellConfig) => {
    if (editingCell) {
      const updatedTaskRows = [...taskRows];
      const rowIndex = editingCell.rowIndex;
      const columnName = editingCell.columnName;
  
      // Ensure config always has a type
      const validConfig = {
        type: config.type || 'text', // Default to 'text' if no type is provided
        ...(config.options && { options: config.options })
      };
  
      // Initialize cellConfigs if it doesn't exist
      if (!updatedTaskRows[rowIndex].cellConfigs) {
        updatedTaskRows[rowIndex].cellConfigs = {};
      }
  
      // Save the configuration
      updatedTaskRows[rowIndex].cellConfigs![columnName] = validConfig;
  
      // If the configuration changes the type, reset the column value
      updatedTaskRows[rowIndex][columnName] = getDefaultValueForType(validConfig.type);
  
      setTaskRows(updatedTaskRows);
  
      // No need to update columns array since field type is per cell
    }
  
    setIsFieldTypeDialogOpen(false);
    setEditingCell(null);
  };
    
function getDefaultValueForType(type: string) {
  switch(type) {
    case 'text': return '';
    case 'number': return '';
    case 'checkbox': return false;
    case 'select': return '';
    case 'multi-select': return [];
    default: return '';
  }
}

  // Function to delete a main actor row
  const handleDelete = (index: number) => {
    const newRows = [...mainActorRows];
    newRows.splice(index, 1);
    setMainActorRows(newRows);
  };

  // Setting the title based on the 'type' parameter
  const title = type
    ? `${type.charAt(0).toUpperCase() + type.slice(1)} Checklist`
    : 'Checklist & Sign';

  // Function to publish changes
// Function to publish changes
// Function to publish changes
const publishChanges = useCallback(async () => {
  // Step 1: Map action types to actors
  const actionTypeToActorMap = mainActorRows.reduce((acc, actor, index) => {
    const actionType = actor.actions.trim().toLowerCase();
    if (actionType) {
      acc[actionType] = `actor${index + 1}`;
    }
    return acc;
  }, {} as { [key: string]: string });

  console.log('Action Type to Actor Map:', actionTypeToActorMap);

  // Step 2: Process taskRows to build entityObjects and extract custom columns
  const updatedTaskRows = taskRows.map((taskRow) => {
    let entityObjects: { [key: string]: any } = {};
    let customFields: { [key: string]: any } = {};

    // Extract custom columns based on the 'columns' state
    columns.forEach((column) => {
      if (
        column.name !== 'Task Number' &&
        column.name !== 'Task Name' &&
        column.name !== 'Actions' &&
        column.name !== 'Remark' &&
        column.name !== 'Entity Type' &&
        column.name !== 'Entity Object' &&
        column.name !== 'Route'
      ) {
        // Assuming custom columns are of type 'text', adjust as needed
        customFields[column.name] = {
          input: taskRow[column.name] !== undefined ? true : false,
          inputText: taskRow[column.name] || ' ',
        };
      }
    });

    // Process entityObjects
    if (taskRow.entityType.length > 0) {
      taskRow.entityType.forEach((entityType) => {
        // Normalize entityType to match the keys in entityData
        const normalizedEntityType = entityType.trim();
        const objectsForType = entityData[normalizedEntityType];

        if (objectsForType) {
          if (taskRow.entityObject.length > 0) {
            // Specific objects selected
            taskRow.entityObject.forEach((objName) => {
              const normalizedObjName = objName.trim();
              // Initialize the entity object entry
              entityObjects[normalizedObjName] = {
                entityType: normalizedEntityType,
              };

              // Add entity-specific fields if any (custom fields are now outside)
              // No action needed here
            });
          } else {
            // No specific objects selected, include all for the type
            Object.keys(objectsForType).forEach((objName) => {
              // Initialize the entity object entry
              entityObjects[objName] = {
                entityType: normalizedEntityType,
              };

              // Add entity-specific fields if any (custom fields are now outside)
              // No action needed here
            });
          }
        } else {
          console.warn(`Entity Type "${normalizedEntityType}" not found in entityData.`);
        }
      });
    }

    return { ...taskRow, entityObjects, ...customFields };
  });

  console.log('Updated Task Rows Before Payload:', JSON.stringify(updatedTaskRows, null, 2));

  // Step 3: Process entities to include in payload
  const processedEntities = Object.keys(entityData).reduce((acc, entityTypeKey) => {
    acc[entityTypeKey] = Object.entries(entityData[entityTypeKey]).reduce(
      (entityAcc, [entityObjKey, entityObjValue]) => {
        entityAcc[entityObjKey] = {
          ID: entityObjValue.ID || '',
          name: entityObjValue.name || '',
        };
        return entityAcc;
      },
      {} as { [key: string]: { ID?: string; name: string } }
    );
    return acc;
  }, {} as { [key: string]: { [key: string]: { ID?: string; name: string } } });

  const payload = {
    [step]: {
      actors: mainActorRows.reduce((acc, actor, index) => {
        acc[`actor${index + 1}`] = {
          action: actor.actions || ' ',
          date: new Date().toUTCString(),
          designation: actor.designation || ' ',
          inspected: 'false',
          name: actor.mainActor || ' ',
          team: actor.team || ' ',
          type: selectedType || ' ',
        };
        return acc;
      }, {} as { [key: string]: any }),
      tasks: updatedTaskRows.reduce((acc, task, index) => {
        // Process actions for the task
        let taskActions: { [key: string]: any } = {};
        if (task.actions) {
          const actionType = task.actions.trim().toLowerCase();
          const actorKey = actionTypeToActorMap[actionType] || `actor1`; // Default to actor1 if not found
          taskActions[`action${index + 1}`] = {
            actionType: task.actions || ' ',
            actor: actorKey, // Dynamically assigned actor
            isSigned: false, // Set to false by default or as required
          };
        }

        acc[`task${index + 1}`] = {
          actions: taskActions,
          entityObjects: task.entityObjects || {},
          remark: {
            input: task.remark,
            remarkText: ' ',
            showRemark: task.remark,
          },
          route: task.route || ' ',
          taskLabel: task.taskName || ' ',
          // Include custom fields directly under the task
          ...Object.keys(task).reduce((customAcc, key) => {
            if (
              ![
                'id',
                'taskNumber',
                'taskName',
                'actions',
                'remark',
                'entityType',
                'entityObject',
                'route',
                'cellConfigs',
                'entityObjects',
              ].includes(key)
            ) {
              customAcc[key] = task[key];
            }
            return customAcc;
          }, {} as { [key: string]: any }),
        };
        return acc;
      }, {} as { [key: string]: any }),
      name: `${type} Checklist`,
      stepOrder: Object.keys(stepMapping).indexOf(type) + 1,
      entities: processedEntities, // Include entities in the payload
    },
  };

  console.log('Final Payload to Send:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      `https://admin-backend-85801868683.us-central1.run.app/Workflows/update/${workflow}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }

    const responseData = await response.json();
    console.log('API Response:', JSON.stringify(responseData, null, 2));

    toast({
      title: 'Changes published successfully',
      description: 'Your changes have been saved and published.',
    });
  } catch (error: any) {
    console.error('Error Response from API:', error);
    toast({
      title: 'Error publishing changes',
      description: error.message || 'There was a problem publishing your changes.',
      variant: 'destructive',
    });
  }
}, [type, taskRows, mainActorRows, workflow, step, entityData, columns,selectedType]);


if (loading) {
    return(
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="flex space-x-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 bg-blue-600 rounded-full animate-loading-dot`}
            style={{
              animationDelay: `${index * 0.15}s`
            }}
          />
        ))}
      </div>
    </div>
    );
  }

  return (
    <div className="p-6 space-y-3 text-lg font-poppins">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <div className="flex items-center space-x-5">
            
              <Button
                className="bg-[#4285F4] text-white hover:bg-[#3367D6] rounded-2xl p-4 text-lg font-normal"
                onClick={publishChanges}
                size="lg"
              >
                Publish changes
              </Button>
              <Select onValueChange={(value) => setSelectedType(value)}>
  <SelectTrigger className="bg-white border border-gray-300">
    <SelectValue placeholder="Select Task" />
  </SelectTrigger>
  <SelectContent className="bg-white">
    <SelectItem value="overall">Overall</SelectItem>
    <SelectItem value="Task">Task</SelectItem>
  </SelectContent>
</Select>


              <Avatar>
                <AvatarFallback className="bg-[#FFA4E8]">L</AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>

      {/* Main Actor Section */}
      <MainActorSection
        mainActorRows={mainActorRows}
        actorData={actorData}
        handleAddMainActorRow={handleAddMainActorRow}
        handleMainActorChange={handleMainActorChange}
        handleDelete={handleDelete}
      />

      {/* Task Table Section */}
      <TaskTable
  taskRows={taskRows}
  handleTaskRowsChange={handleTaskRowsChange}
  columns={columns}
  mainActorRows={mainActorRows}
  entityTypes={entityTypes}
  handleTaskChange={handleTaskChange}
  handleEntityTypeChange={handleEntityTypeChange}
  openFieldTypeDialog={openFieldTypeDialog}
  handleEntitySelection={handleEntitySelection}
  handleAddTaskRow={handleAddTaskRow}
  setIsColumnDialogOpen={setIsColumnDialogOpen}
  handleDelete={handleDelete}
  setIsFieldTypeDialogOpen={setIsFieldTypeDialogOpen}
  handleCellConfigSave={handleCellConfigSave}
/>
      {/* Configure Columns Dialog */}
      <ConfigureColumnsDialog
        isOpen={isColumnDialogOpen}
        onOpenChange={setIsColumnDialogOpen}
        columns={columns}
        setColumns={setColumns}
        newColumnName={newColumnName}
        setNewColumnName={setNewColumnName}
        addCustomColumn={addCustomColumn}
      />

      {/* Field Type Dialog */}
      <FieldTypeDialog
        open={isFieldTypeDialogOpen}
        onOpenChange={setIsFieldTypeDialogOpen}
        columnName={editingCell?.columnName || ''}
        onSave={handleCellConfigSave}
        initialConfig={
          editingCell
            ? taskRows[editingCell.rowIndex].cellConfigs?.[
                editingCell.columnName
              ]
            : undefined
        }
      />
    </div>
  );
}
