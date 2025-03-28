
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport, disabled = false }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onExport}
            disabled={disabled}
            className="ml-2"
            variant="outline"
          >
            <FileJson className="mr-1" />
            ESPORTA JSON
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Esporta i dati degli investitori in formato JSON</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExportButton;
