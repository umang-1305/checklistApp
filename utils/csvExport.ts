export function exportToCSV(columns: Column[], rows: Row[]) {
    const visibleColumns = columns.filter(col => col.visible);
    const headers = visibleColumns.map(col => col.name).join(',');
    const csvContent = rows.map(row => 
      visibleColumns.map(col => {
        const cellValue = row[col.name];
        if (Array.isArray(cellValue)) {
          return `"${cellValue.join(', ')}"`;
        } else if (typeof cellValue === 'object') {
          return '';
        } else {
          return `"${cellValue}"`;
        }
      }).join(',')
    ).join('\n');
  
    const csv = `${headers}\n${csvContent}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'checklist_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  