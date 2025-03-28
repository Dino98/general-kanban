
import * as XLSX from 'xlsx';
import { Investor, InvestorStatus } from './excelParser';

/**
 * Generates an empty Excel template with the correct columns
 */
export const generateExcelTemplate = () => {
  // Create worksheet with header row
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Investitore', 'Tipologia', 'Descrizione / Operazione', 'Investimento Min', 'Investimento Max', 'Email', 'LinkedIn']
  ]);
  
  // Add some example data
  XLSX.utils.sheet_add_aoa(worksheet, [
    ['Nome Investitore', 'Family Office', 'Descrizione dell\'investitore o dell\'operazione', 100000, 500000, 'email@esempio.com', 'https://linkedin.com/in/username']
  ], { origin: 'A2' });
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Investitori');
  
  // Export and download
  XLSX.writeFile(workbook, 'template_investitori.xlsx');
};

/**
 * Exports all investors data to Excel
 */
export const exportInvestorsToExcel = (investors: Investor[]) => {
  if (!investors || !investors.length) return;
  
  // Prepare the data for Excel export
  const exportData = investors.map(investor => ({
    'Investitore': investor.name,
    'Tipologia': investor.type,
    'Descrizione / Operazione': investor.description,
    'Status': investor.status,
    'Investimento Min': investor.investmentMin,
    'Investimento Max': investor.investmentMax,
    'Email': investor.email,
    'LinkedIn': investor.linkedin,
    'Data Creazione': new Date(investor.createdAt).toLocaleDateString('it-IT')
  }));
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Apply some styling to the header row (bold)
  // This is simple styling as XLSX doesn't support much formatting
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellRef]) continue;
    worksheet[cellRef].s = { font: { bold: true } };
  }
  
  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Investitori');
  
  // Export and download the file
  XLSX.writeFile(workbook, `investitori_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
