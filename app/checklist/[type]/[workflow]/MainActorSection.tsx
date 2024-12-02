// app/checklist/[type]/[workflow]/MainActorSection.tsx

import React from 'react';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/app/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MainActorRow {
  actions: string;
  mainActor: string | null;
  team: string | null;
  designation: string | null;
  id: string;
  person: string;
}

interface ActorData {
  Designated_Actor: string;
  field: string;
  designation: string;
  id: string;
  person: string;
}

interface MainActorSectionProps {
  mainActorRows: MainActorRow[];
  actorData: ActorData[];
  handleAddMainActorRow: () => void;
  handleMainActorChange: (
    index: number,
    field: keyof MainActorRow,
    value: string | null
  ) => void;
  handleDelete: (index: number) => void;
}

export const MainActorSection: React.FC<MainActorSectionProps> = ({
  mainActorRows,
  actorData,
  handleAddMainActorRow,
  handleMainActorChange,
  handleDelete,
}) => {
  return (
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
            <div
              key={index}
              className="grid grid-cols-4 gap-4 items-center"
            >
              <Input
                placeholder="Enter your Action"
                value={row.actions}
                onChange={(e) =>
                  handleMainActorChange(index, 'actions', e.target.value)
                }
                className="bg-gray-50 text-gray-500 text-base"
              />
              <Select
                value={row.mainActor || ''}
                onValueChange={(value) =>
                  handleMainActorChange(index, 'mainActor', value || null)
                }
              >
                <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                  <SelectValue placeholder="Select Actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="realtime" value="realtime">
                    Check on Realtime
                  </SelectItem>
                  {actorData.map((actor) => (
                    <SelectItem
                      key={actor.id}
                      value={actor.Designated_Actor}
                    >
                      {actor.Designated_Actor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={row.mainActor?.toLowerCase() === 'realtime' ? '' : row.team || ''}
                onValueChange={(value) =>
                  handleMainActorChange(index, 'team', value || null)
                }
                disabled={row.mainActor?.toLowerCase() === 'realtime'}
              >
                <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                  <SelectValue placeholder="Select the team" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    new Set(actorData.map((actor) => actor.field))
                  ).map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-row gap-x-3">
                <Select
                  value={row.mainActor?.toLowerCase() === 'realtime' ? '' : row.designation || ''}
                  onValueChange={(value) =>
                    handleMainActorChange(index, 'designation', value || null)
                  }
                  disabled={row.mainActor?.toLowerCase() === 'realtime'}
                >
                  <SelectTrigger className=" border border-gray-300 focus:border-[#4285F4] transition-colors duration-200 bg-gray-50 focus:bg-white  text-gray-500">
                    <SelectValue placeholder="Select the Designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Set(
                        actorData.map((actor) => actor.designation)
                      )
                    ).map((designation) => (
                      <SelectItem key={designation} value={designation}>
                        {designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleDelete(index)}
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
          <Button
            className=" bg-[#4285F4] text-white hover:bg-[#3367D6] text-lg rounded-xl"
            size="lg"
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};