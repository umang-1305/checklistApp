import React from 'react'
import { Checkbox } from "@/app/components/ui/checkbox"
import { Label } from "@/app/components/ui/label"

interface CustomCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: (checked: boolean) => string
}

export function CustomCheckbox({ checked, onCheckedChange, label }: CustomCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} id="custom-checkbox" />
      <Label htmlFor="custom-checkbox">{label(checked)}</Label>
    </div>
  )
}

