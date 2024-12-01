export const MultiSelectPreview: React.FC<{ selected: string[]; entityTypes: EntityType[] }> = ({ selected, entityTypes }) => {
  const MAX_DISPLAY = 4
  const selectedNames = selected.map(value => {
    const entityType = entityTypes.find(et => et.children.some(child => child.value === value))
    const child = entityType?.children.find(child => child.value === value)
    return child?.name || value
  })

  if (selectedNames.length === 0) {
    return <span className="text-muted-foreground">Select entity type/objects</span>
  }

  if (selectedNames.length <= MAX_DISPLAY) {
    return <span>{selectedNames.join(', ')}</span>
  }

  return (
    <span>
      {selectedNames.slice(0, MAX_DISPLAY).join(', ')} +{selectedNames.length - MAX_DISPLAY} more
    </span>
  )
}