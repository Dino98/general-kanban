import React, { useRef, useState, useEffect } from "react";
import { parseExcelFile } from "@/utils/excelParser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileJson, Copy, ExternalLink, Upload, FileSpreadsheet, Download } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { exportInvestorsToExcel, generateExcelTemplate } from "@/utils/excelExporter"; 

interface SettingsProps {
  onImport: (data: any[]) => void;
  onExportJson?: () => void;
  hasData?: boolean;
  jsonId?: string;
  onSetJsonId?: (id: string) => void;
  investors?: any[]; // Add investors prop for Excel export
}

const Settings: React.FC<SettingsProps> = ({ 
  onImport, 
  onExportJson, 
  hasData = false, 
  jsonId,
  onSetJsonId,
  investors = [] // Default to empty array
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newJsonId, setNewJsonId] = useState("");
  const [loadJsonId, setLoadJsonId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a JSON ID, set it as the current one
    if (jsonId) {
      setNewJsonId(jsonId);
    }
  }, [jsonId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const investors = await parseExcelFile(file);
      onImport(investors);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateId = () => {
    // Generate a new ID using only the first part of the UUID (to match the format of the example)
    const newId = uuidv4().split('-')[0];
    setNewJsonId(newId);
    
    if (onSetJsonId) {
      onSetJsonId(newId);
      toast.success("Nuovo ID progetto generato", {
        description: "L'ID è stato generato e salvato."
      });
    }
  };

  const handleLoadProjectById = () => {
    if (!loadJsonId || loadJsonId.trim() === "") {
      toast.error("ID progetto non valido", {
        description: "Inserisci un ID valido per caricare il progetto."
      });
      return;
    }
    
    // Update URL with the new ID and reload the page
    const baseUrl = window.location.origin;
    const newUrl = `${baseUrl}/?id=${loadJsonId.trim()}`;
    window.location.href = newUrl;
  };

  const handleCopyId = () => {
    if (jsonId) {
      navigator.clipboard.writeText(jsonId);
      toast.success("ID copiato negli appunti");
    }
  };

  const getKanbanUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?id=${jsonId}`;
  };

  const handleOpenWithId = () => {
    if (jsonId) {
      const url = getKanbanUrl();
      window.open(url, '_blank');
    }
  };

  const handleExportExcelTemplate = () => {
    generateExcelTemplate();
    toast.success("Template Excel generato", {
      description: "Il file template vuoto è stato scaricato."
    });
  };

  const handleExportExcel = () => {
    if (investors.length === 0) {
      toast.warning("Nessun dato da esportare", {
        description: "Importa prima i dati degli investitori",
        duration: 3000
      });
      return;
    }
    
    exportInvestorsToExcel(investors);
    toast.success("Dati esportati in Excel", {
      description: "Il file Excel è stato scaricato."
    });
  };

  return (
    <div className="container px-4 mx-auto py-8 animate-fade-in max-w-4xl">
      <h1 className="text-2xl font-medium mb-8 text-center">Impostazioni</h1>
      
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>ID Progetto</CardTitle>
          <CardDescription>
            Gestisci l'ID univoco del tuo progetto Kanban
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jsonId ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input 
                  value={jsonId} 
                  readOnly 
                  className="font-mono bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyId}
                  title="Copia ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Questo ID viene usato per salvare e recuperare i dati del tuo progetto Kanban.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={handleOpenWithId}
                  className="flex items-center"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Apri Kanban con questo ID
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nessun ID progetto configurato. Genera un nuovo ID per iniziare.
              </p>
              <Button
                onClick={handleGenerateId}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Genera un nuovo ID progetto
              </Button>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Carica progetto esistente</h3>
            <div className="flex items-center space-x-2">
              <Input 
                value={loadJsonId} 
                onChange={(e) => setLoadJsonId(e.target.value)}
                placeholder="Inserisci ID del progetto"
                className="font-mono"
              />
              <Button
                onClick={handleLoadProjectById}
                className="flex items-center whitespace-nowrap"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Carica ID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>Importa Dati</CardTitle>
          <CardDescription>
            Carica un file Excel con la lista degli investitori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center flex-wrap gap-2">
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
              disabled={!jsonId}
            >
              Seleziona File Excel
            </Button>

            <Button
              onClick={handleExportExcelTemplate}
              variant="outline"
              className="flex items-center"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Scarica Template
            </Button>

            {!jsonId && (
              <p className="ml-4 text-sm text-amber-600">
                Genera prima un ID progetto
              </p>
            )}
            {jsonId && (
              <p className="ml-4 text-sm text-muted-foreground">
                Formati supportati: .xlsx
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>Esporta Dati</CardTitle>
          <CardDescription>
            Esporta i dati degli investitori in formati diversi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {onExportJson && (
              <Button
                onClick={onExportJson}
                disabled={!hasData || !jsonId}
                variant="outline"
                className="flex items-center"
              >
                <FileJson className="mr-2 h-4 w-4" />
                Esporta JSON
              </Button>
            )}

            <Button
              onClick={handleExportExcel}
              disabled={!hasData || !jsonId}
              variant="outline"
              className="flex items-center"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Esporta Excel
            </Button>

            {!jsonId && (
              <p className="mt-2 text-sm text-amber-600 w-full">
                Genera prima un ID progetto
              </p>
            )}
            {jsonId && !hasData && (
              <p className="mt-2 text-sm text-muted-foreground w-full">
                Non ci sono dati da esportare. Importa prima i dati degli investitori.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Preferenze Kanban</CardTitle>
          <CardDescription>
            Personalizza il funzionamento della tua board Kanban
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Altre impostazioni verranno aggiunte presto...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
