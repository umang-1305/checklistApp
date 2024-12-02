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
// Update the initial columns state
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
    return Object.entries(entityData).map(([key, value]) => {
      const children = Object.entries(value)
        .filter(
          ([childKey]) =>
            childKey !== 'id' && typeof value[childKey] === 'object'
        )
        .map(([childKey, childValue]) => ({
          name: (childValue as { Name?: string })?.Name || childKey,
          value: (
            (childValue as { Name?: string })?.Name || childKey
          )
            .toLowerCase()
            .replace(/\s+/g, '_'),
        }));

      return {
        name: value.id || key,
        value: (value.id || key).toLowerCase().replace(/\s+/g, '_'),
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
      newRows[rowIndex].entityType = [updatedEntityType]; // Single entity type for now
      newRows[rowIndex].entityObject = []; // Clear entity object when entity type changes
      return newRows;
    });
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
    setEditingCell({ rowIndex, columnName });
    setIsFieldTypeDialogOpen(true);
  };

  // Function to save cell configuration
  const handleCellConfigSave = (config: CellConfig) => {
    if (editingCell) {
      const updatedTaskRows = [...taskRows];
      if (!updatedTaskRows[editingCell.rowIndex].cellConfigs) {
        updatedTaskRows[editingCell.rowIndex].cellConfigs = {};
      }
      updatedTaskRows[editingCell.rowIndex].cellConfigs![
        editingCell.columnName
      ] = config;
      setTaskRows(updatedTaskRows);
    }
    setIsFieldTypeDialogOpen(false);
    setEditingCell(null);
  };

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
  const publishChanges = useCallback(async () => {
    const actors = mainActorRows.reduce((acc, actor, index) => {
      if (actor.actions && actor.mainActor) {
        acc[`actor${index + 1}`] = {
          action: actor.actions,
          date: new Date().toUTCString(),
          designation: actor.designation,
          name: actor.mainActor,
          team: actor.team,
        };
      }
      return acc;
    }, {} as Record<string, any>);

    const tasks = taskRows.reduce((acc, task, index) => {
      const taskKey = `task${index + 1}`;
      const actions = mainActorRows.reduce(
        (actionsAcc, actor, actorIndex) => {
          if (
            task.actions === actor.actions &&
            actor.actions &&
            actor.mainActor
          ) {
            const actionKey = `action${actorIndex + 1}`;
            actionsAcc[actionKey] = {
              actionType: actor.actions,
              actor: actor.mainActor,
              isSigned: false,
            };
          }
          return actionsAcc;
        },
        {} as Record<string, any>
      );

      const entityObjects = task.entityType.reduce(
        (entityAcc, entity, entityIndex) => {
          entityAcc[`EO${entityIndex + 1}`] = {
            customInput: {
              input: true,
              inputText: '',
            },
            entityType: entity,
          };
          return entityAcc;
        },
        {} as Record<string, any>
      );

      acc[taskKey] = {
        actions,
        entityObjects,
        remark: {
          input: task.remark,
          remarkText: '',
          showRemark: task.remark,
        },
        route: task.route || '',
        taskLabel: task.taskName,
      };

      // Add custom columns
      columns.forEach((column) => {
        if (column.type && column.type !== 'checkbox' && task[column.name]) {
          if (!acc[taskKey].entityObjects.EO1.customInput) {
            acc[taskKey].entityObjects.EO1.customInput = {};
          }
          acc[taskKey].entityObjects.EO1.customInput[column.name] = {
            input: true,
            inputText: task[column.name],
          };
        }
      });

      return acc;
    }, {} as Record<string, any>);

    const payload = {
      [step]: {
        actors,
        entities: {}, // Populate this as needed
        name: `${type} Checklist`,
        stepOrder: Object.keys(stepMapping).indexOf(type) + 1,
        tasks,
      },
    };

    // Check if tasks object is empty
    if (Object.keys(tasks).length === 0) {
      toast({
        title: 'Error publishing changes',
        description: 'Please add at least one valid task before publishing.',
        variant: 'destructive',
      });
      return;
    }

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

      toast({
        title: 'Changes published successfully',
        description: 'Your changes have been saved and published.',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error publishing changes',
        description:
          error instanceof Error
            ? error.message
            : 'There was a problem publishing your changes. Please try again.',
        variant: 'destructive',
      });
    }
  }, [type, taskRows, mainActorRows, columns, workflow, step]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-3 text-lg font-poppins">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <div className="flex items-center space-x-4">
              <Button
                className="bg-[#4285F4] text-white hover:bg-[#3367D6] rounded-2xl p-4 text-lg font-normal"
                onClick={publishChanges}
                size="lg"
              >
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
        columns={columns}
        mainActorRows={mainActorRows}
        entityTypes={entityTypes}
        handleTaskChange={handleTaskChange}
        handleEntityTypeChange={handleEntityTypeChange}
        openFieldTypeDialog={openFieldTypeDialog}
        handleAddTaskRow={handleAddTaskRow}
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
