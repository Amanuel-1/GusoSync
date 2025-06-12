import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Generic type for table data
export interface ExportableData {
  [key: string]: any;
}

// Export configuration interface
export interface ExportConfig {
  filename: string;
  sheetName?: string;
  headers?: { [key: string]: string }; // Maps data keys to display names
  excludeFields?: string[]; // Fields to exclude from export
  formatters?: { [key: string]: (value: any) => string }; // Custom formatters for specific fields
}

/**
 * Converts data to CSV format
 */
export function convertToCSV(data: ExportableData[], config: ExportConfig): string {
  if (!data || data.length === 0) {
    return '';
  }

  const { headers, excludeFields = [], formatters = {} } = config;
  
  // Get all unique keys from the data, excluding specified fields
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  ).filter(key => !excludeFields.includes(key));

  // Create header row
  const headerRow = allKeys.map(key => headers?.[key] || key);
  
  // Create data rows
  const dataRows = data.map(item => 
    allKeys.map(key => {
      let value = item[key];
      
      // Apply custom formatter if available
      if (formatters[key]) {
        value = formatters[key](value);
      } else if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    })
  );

  // Combine header and data rows
  const allRows = [headerRow, ...dataRows];
  
  return allRows.map(row => row.join(',')).join('\n');
}

/**
 * Exports data as CSV file
 */
export function exportToCSV(data: ExportableData[], config: ExportConfig): void {
  try {
    const csvContent = convertToCSV(data, config);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = config.filename.endsWith('.csv') ? config.filename : `${config.filename}.csv`;
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export CSV file');
  }
}

/**
 * Exports data as Excel file
 */
export function exportToExcel(data: ExportableData[], config: ExportConfig): void {
  try {
    const { headers, excludeFields = [], formatters = {}, sheetName = 'Sheet1' } = config;
    
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Get all unique keys from the data, excluding specified fields
    const allKeys = Array.from(
      new Set(data.flatMap(item => Object.keys(item)))
    ).filter(key => !excludeFields.includes(key));

    // Prepare data for Excel with headers
    const excelData = data.map(item => {
      const row: { [key: string]: any } = {};
      allKeys.forEach(key => {
        const displayKey = headers?.[key] || key;
        let value = item[key];
        
        // Apply custom formatter if available
        if (formatters[key]) {
          value = formatters[key](value);
        } else if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        row[displayKey] = value;
      });
      return row;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = Object.keys(excelData[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
    });
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = config.filename.endsWith('.xlsx') ? config.filename : `${config.filename}.xlsx`;
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export Excel file');
  }
}

/**
 * Generic export function that handles both CSV and Excel
 */
export function exportData(
  data: ExportableData[], 
  format: 'csv' | 'excel', 
  config: ExportConfig
): void {
  if (format === 'csv') {
    exportToCSV(data, config);
  } else if (format === 'excel') {
    exportToExcel(data, config);
  } else {
    throw new Error('Unsupported export format');
  }
}

// Utility function to format common data types
export const commonFormatters = {
  date: (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  },
  
  datetime: (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  },
  
  boolean: (value: any) => {
    if (value === null || value === undefined) return '';
    return value ? 'Yes' : 'No';
  },
  
  currency: (value: any) => {
    if (value === null || value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  },
  
  number: (value: any) => {
    if (value === null || value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat('en-US').format(value);
  }
};
