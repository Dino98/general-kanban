import React, { useEffect, useState } from "react";
import { Investor } from "@/utils/excelParser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Mail, Linkedin } from "lucide-react";

interface EditModalProps {
  investor: Investor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedInvestor: Investor) => void;
  allInvestors: Investor[]; // Added to get all investors for distinct types
}

const INVESTOR_STATUSES = [
  "Da contattare",
  "Contattati",
  "Interessati",
  "Negoziazione",
  "A bordo!",
  "Drop definitivo",
] as const;

const EditModal: React.FC<EditModalProps> = ({
  investor,
  isOpen,
  onClose,
  onSave,
  allInvestors,
}) => {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>();
  const [investmentMin, setInvestmentMin] = React.useState<string>("");
  const [investmentMax, setInvestmentMax] = React.useState<string>("");
  const [isCustomType, setIsCustomType] = React.useState(false);
  const [customType, setCustomType] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  
  // Get distinct investor types
  const getDistinctTypes = (): string[] => {
    if (!allInvestors || allInvestors.length === 0) return [];
    
    const typesSet = new Set<string>();
    allInvestors.forEach(inv => {
      if (inv.type && inv.type.trim() !== "") {
        typesSet.add(inv.type);
      }
    });
    
    return Array.from(typesSet).sort();
  };
  
  const distinctTypes = getDistinctTypes();

  useEffect(() => {
    if (investor) {
      setName(investor.name);
      setType(investor.type || ""); // Ensure type is never undefined
      setDescription(investor.description || ""); // Ensure description is never undefined
      setStatus(investor.status);
      setInvestmentMin(investor.investmentMin?.toString() || "");
      setInvestmentMax(investor.investmentMax?.toString() || "");
      setEmail(investor.email || ""); // Ensure email is never undefined
      setLinkedin(investor.linkedin || ""); // Ensure linkedin is never undefined
      setIsCustomType(false);
      setCustomType("");
    }
  }, [investor]);

  const handleSave = () => {
    if (!investor) return;
    
    console.log("EditModal handleSave called");
    
    // Create the updated investor object with all required fields
    const updatedInvestor: Investor = {
      ...investor,
      name: name,
      type: isCustomType ? customType : type,
      description: description || "", // Ensure description is never undefined
      status: status as any || investor.status,
      investmentMin: investmentMin ? Number(investmentMin) : undefined,
      investmentMax: investmentMax ? Number(investmentMax) : undefined,
      email: email || "", // Ensure email is never undefined
      linkedin: linkedin || "", // Ensure linkedin is never undefined
    };
    
    console.log("Calling onSave with updated investor:", updatedInvestor);
    onSave(updatedInvestor);
    onClose();
  };

  const handleTypeChange = (value: string) => {
    if (value === "ALTRO") {
      setIsCustomType(true);
    } else {
      setIsCustomType(false);
      setType(value);
    }
  };

  const handleCustomTypeSave = () => {
    if (customType && customType.trim() !== "") {
      setType(customType);
      setIsCustomType(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-morphism border-primary/10">
        <DialogHeader>
          <DialogTitle>Modifica Investitore</DialogTitle>
          <DialogDescription>
            Modifica i dettagli dell'investitore. Tutti i campi sono salvati automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Investitore</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome dell'investitore"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type">Tipologia</Label>
            {isCustomType ? (
              <div className="flex gap-2">
                <Input
                  id="customType"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Inserisci nuova tipologia"
                />
                <Button onClick={handleCustomTypeSave} size="sm">
                  Salva
                </Button>
              </div>
            ) : (
              <Select
                value={type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona una tipologia" />
                </SelectTrigger>
                <SelectContent>
                  {distinctTypes.map((typeOption) => (
                    <SelectItem key={typeOption} value={typeOption}>
                      {typeOption}
                    </SelectItem>
                  ))}
                  <SelectItem value="ALTRO">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>ALTRO</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="investmentMin">Investimento MIN</Label>
              <Input
                id="investmentMin"
                type="number"
                value={investmentMin}
                onChange={(e) => setInvestmentMin(e.target.value)}
                placeholder="Valore minimo"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="investmentMax">Investimento MAX</Label>
              <Input
                id="investmentMax"
                type="number"
                value={investmentMax}
                onChange={(e) => setInvestmentMax(e.target.value)}
                placeholder="Valore massimo"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email (opzionale)</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email dell'investitore"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="linkedin">LinkedIn URL (opzionale)</Label>
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              <Input
                id="linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="URL profilo LinkedIn"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione o note sull'operazione"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Stato</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona uno stato" />
              </SelectTrigger>
              <SelectContent>
                {INVESTOR_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave}>Salva Modifiche</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
