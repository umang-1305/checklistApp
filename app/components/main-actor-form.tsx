'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Label } from "@/app/components/ui/label"
import { Trash2 } from 'lucide-react'

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
    <div className="mt-8 space-y-4 bg-white p-4 rounded-md">
      <h2 className="text-xl font-bold text-[#4682B4]">Main Actor Configuration</h2>
      <div className="grid grid-cols-4 gap-4 mb-2 text-[#4682B4]">
        <div className="font-medium">Main Actor</div>
        <div className="font-medium">Team</div>
        <div className="font-medium">Designation</div>
        <div className="font-medium">Actions</div>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 items-center">
          <Select
            value={row.mainActor}
            onValueChange={(value) => handleInputChange(index, 'mainActor', value)}
          >
            <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue placeholder="Enter Name" />
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
            <SelectTrigger>
              <SelectValue placeholder="Type Object" />
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="flex items-center text-[#4682B4] hover:text-[#4682B4] hover:bg-[#E6F3FF]"
        onClick={handleAddRow}
      >
        <span className="mr-2">+</span>
        Add Row
      </Button>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="real-time"
          checked={realTime}
          onCheckedChange={(checked) => setRealTime(checked as boolean)}
        />
        <Label htmlFor="real-time" className="text-sm text-[#4682B4] cursor-pointer">
          Keep all as real time
        </Label>
      </div>
    </div>
  );
}

