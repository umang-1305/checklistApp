import React from 'react'
import { Input } from "@/components/ui/input"

interface CustomInputProps {
  value: string
  onChange: (value: string) => void
  allowedInputs: string[]
}

export function CustomInput({ value, onChange, allowedInputs }: CustomInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    if (allowedInputs.includes('Numbers') && !allowedInputs.includes('Alphabets') && !allowedInputs.includes('Special characters')) {
      newValue = newValue.replace(/[^0-9]/g, '')
    } else if (allowedInputs.includes('Alphabets') && !allowedInputs.includes('Numbers') && !allowedInputs.includes('Special characters')) {
      newValue = newValue.replace(/[^a-zA-Z]/g, '')
    } else if (!allowedInputs.includes('Special characters')) {
      newValue = newValue.replace(/[^a-zA-Z0-9]/g, '')
    }
    onChange(newValue)
  }

  return (
    <Input value={value} onChange={handleChange} />
  )
}

