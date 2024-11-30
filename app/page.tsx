'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"

export default function Home() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string>('')

  const handleOptionChange = (value: string) => {
    setSelectedOption(value)
    router.push(`/checklist/${value}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Select Checklist Type</h1>
        <Select onValueChange={handleOptionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a checklist type" />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            <SelectItem value="production">Production Checklist</SelectItem>
            <SelectItem value="quality">Quality Control Checklist</SelectItem>
            <SelectItem value="safety">Safety Inspection Checklist</SelectItem>
            <SelectItem value="maintenance">Maintenance Checklist</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

