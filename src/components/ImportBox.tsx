
import React, { useRef } from "react";
import { parseExcelFile } from "@/utils/excelParser";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImportBoxProps {
  onImport: (data: any[]) => void;
}

const ImportBox: React.FC<ImportBoxProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const investors = await parseExcelFile(file);
      onImport(investors);
      
      // Show notification about parsed file
      toast.success(
        `File Excel importato con successo`,
        {
          description: `${investors.length} investitori trovati nel file`,
          duration: 3000
        }
      );
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Errore nell'importazione del file Excel", {
        duration: 3000
      });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 p-6 rounded-xl bg-white/60 backdrop-blur-md card-shadow animate-scale-in">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-foreground/90">
          Importa file Excel degli investitori
        </h3>
        <p className="text-sm text-foreground/60 mt-1">
          Carica un file Excel con la lista degli investitori
        </p>
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <input
          type="file"
          id="excelFile"
          ref={fileInputRef}
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Seleziona File Excel
        </Button>
      </div>
    </div>
  );
};

export default ImportBox;
