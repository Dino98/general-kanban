
import * as XLSX from 'xlsx';

export interface Investor {
  id: string;
  name: string;
  type: string;
  description: string;
  status: InvestorStatus;
  investmentMin?: number;
  investmentMax?: number;
  createdAt: string;
  email: string;
  linkedin: string;
}

export type InvestorStatus = 
  | "Da contattare" 
  | "Contattati" 
  | "Interessati" 
  | "Negoziazione" 
  | "A bordo!" 
  | "Drop definitivo";

export const parseExcelFile = (file: File): Promise<Investor[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          reject("Failed to read file");
          return;
        }
        
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        const investors: Investor[] = json.map((row: any, index) => ({
          id: `investor-${Date.now()}-${index}`,
          name: row['Investitore'] || 'Senza nome',
          type: row['Tipologia'] || '',
          description: row['Descrizione / Operazione'] || '',
          status: 'Da contattare' as InvestorStatus,
          investmentMin: row['Investimento Min'] ? Number(row['Investimento Min']) : undefined,
          investmentMax: row['Investimento Max'] ? Number(row['Investimento Max']) : undefined,
          createdAt: new Date().toISOString(), // Add the current date as createdAt
          email: row['Email'] || '',
          linkedin: row['LinkedIn'] || ''
        }));
        
        resolve(investors);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};
