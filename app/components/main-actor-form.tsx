'use client';

import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Trash2 } from 'lucide-react';

interface MainActorRow {
  mainActor: string;
  team: string;
  designation: string;
}

export function MainActorForm() {
  const [rows, setRows] = useState<MainActorRow[]>([{ mainActor: '', team: '', designation: '' }]);
  const [realTime, setRealTime] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { mainActor: '', team: '', designation: '' }]);
  };

  const handleInputChange = (index: number, field: keyof MainActorRow, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Main Actor Configuration</h2>
      <div className="grid grid-cols-4 gap-4 mb-4 text-blue-700 font-semibold">
        <div>Main Actor</div>
        <div>Team</div>
        <div>Designation</div>
        <div>Actions</div>
      </div>
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-4 items-center py-3 px-4 bg-gray-50 rounded-md mb-2 hover:shadow-sm"
        >
          <Select
            value={row.mainActor}
            onValueChange={(value) => handleInputChange(index, 'mainActor', value)}
          >
            <SelectTrigger className="bg-white text-gray-700">
              <SelectValue placeholder="Select actor..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actor1">Actor 1</SelectItem>
              <SelectItem value="actor2">Actor 2</SelectItem>
              <SelectItem value="actor3">Actor 3</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={row.team}
            onValueChange={(value) => handleInputChange(index, 'team', value)}
          >
            <SelectTrigger className="bg-white text-gray-700">
              <SelectValue placeholder="Select team..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team1">Team 1</SelectItem>
              <SelectItem value="team2">Team 2</SelectItem>
              <SelectItem value="team3">Team 3</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={row.designation}
            onValueChange={(value) => handleInputChange(index, 'designation', value)}
          >
            <SelectTrigger className="bg-white text-gray-700">
              <SelectValue placeholder="Select designation..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="designation1">Designation 1</SelectItem>
              <SelectItem value="designation2">Designation 2</SelectItem>
              <SelectItem value="designation3">Designation 3</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteRow(index)}
            disabled={rows.length === 1}
            className="hover:bg-red-100"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="mt-4 flex items-center justify-center w-full text-blue-700 hover:bg-blue-100 border border-blue-300"
        onClick={handleAddRow}
      >
        <span className="mr-2">+</span>
        Add Row
      </Button>
      <div className="flex items-center space-x-2 mt-6">
        <Checkbox
          id="real-time"
          checked={realTime}
          onCheckedChange={(checked) => setRealTime(checked as boolean)}
        />
        <Label htmlFor="real-time" className="text-sm text-gray-700 cursor-pointer">
          Keep all as real time
        </Label>
      </div>
    </div>
  );
}
