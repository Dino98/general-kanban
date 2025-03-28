
import { useState } from "react";
import { Investor } from "@/utils/excelParser";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { kanbanApi } from "@/services/api";

export function useInvestorActions(
  investors: Investor[],
  onUpdateInvestors: (investors: Investor[]) => void,
  jsonId?: string
) {
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditInvestor = (investor: Investor) => {
    setEditingInvestor(investor);
    setIsModalOpen(true);
  };

  const handleAddInvestor = (status: string) => {
    // Create a new empty investor with the given status
    const newInvestor: Investor = {
      id: uuidv4(),
      name: "",
      type: "",
      description: "",
      status: status as any,
      createdAt: new Date().toISOString(),
      email: "",
      linkedin: "",
    };
    
    setEditingInvestor(newInvestor);
    setIsModalOpen(true);
  };

  const handleSaveInvestor = async (updatedInvestor: Investor) => {
    console.log("handleSaveInvestor called with:", updatedInvestor);
    
    // Validate all required fields are present
    if (!updatedInvestor.id || 
        !updatedInvestor.name || 
        typeof updatedInvestor.type !== 'string' ||
        typeof updatedInvestor.description !== 'string' ||
        !updatedInvestor.status || 
        !updatedInvestor.createdAt || 
        typeof updatedInvestor.email !== 'string' ||
        typeof updatedInvestor.linkedin !== 'string') {
      console.error("Invalid investor data - missing required fields:", updatedInvestor);
      toast.error("Dati investitore incompleti", {
        description: "Impossibile salvare dati incompleti. Verifica tutti i campi obbligatori.",
      });
      return;
    }
    
    let newInvestors: Investor[] = [];
    const existingInvestor = investors.find(inv => inv.id === updatedInvestor.id);
    
    if (existingInvestor) {
      // Update existing investor
      newInvestors = investors.map((investor) =>
        investor.id === updatedInvestor.id ? updatedInvestor : investor
      );
      onUpdateInvestors(newInvestors);
      toast.success("Investitore aggiornato con successo");
    } else {
      // Add new investor at the top of the list
      // First get all investors in the same status group
      const sameStatusInvestors = investors.filter(inv => inv.status === updatedInvestor.status);
      
      // If there are no investors in this status, just add the new one
      if (sameStatusInvestors.length === 0) {
        newInvestors = [updatedInvestor, ...investors];
      } else {
        // Add the new investor at the top of its status group
        newInvestors = [...investors];
        
        // Find the index of the first investor with the same status
        const firstIndex = newInvestors.findIndex(inv => inv.status === updatedInvestor.status);
        
        // Insert the new investor at that position
        if (firstIndex !== -1) {
          newInvestors.splice(firstIndex, 0, updatedInvestor);
        } else {
          // Fallback: just add to the beginning
          newInvestors.unshift(updatedInvestor);
        }
      }
      
      onUpdateInvestors(newInvestors);
      toast.success("Nuovo investitore aggiunto con successo");
    }
    
    try {
      // 1. First, save the complete investor data
      console.log("Saving investors after edit/add:", newInvestors.length);
      const saveResult = await kanbanApi.saveInvestors(newInvestors, jsonId);
      console.log("Save after edit/add result:", saveResult);
      
      // 2. Then, track the update with the new API
      const isEdit = existingInvestor !== undefined;
      const noteText = isEdit 
        ? `Aggiornato investitore: ${updatedInvestor.name}`
        : `Nuovo investitore: ${updatedInvestor.name}`;
      
      const trackResult = await kanbanApi.trackCardUpdate(noteText, jsonId);
      console.log("Track update result:", trackResult);
    } catch (error) {
      console.error("Error saving after edit/add:", error);
      toast.error("Errore durante il salvataggio", {
        description: "Impossibile salvare le modifiche sul server. Riprova più tardi."
      });
    }
  };

  const handleDeleteInvestor = async (investorId: string) => {
    console.log("handleDeleteInvestor called with ID:", investorId);
    
    // Find the investor name before deletion for the note
    const investorToDelete = investors.find(inv => inv.id === investorId);
    const investorName = investorToDelete?.name || "Sconosciuto";
    
    const newInvestors = investors.filter(investor => investor.id !== investorId);
    onUpdateInvestors(newInvestors);
    
    try {
      // 1. First, save the updated investors array
      console.log("Saving investors after delete. New count:", newInvestors.length);
      const saveResult = await kanbanApi.saveInvestors(newInvestors, jsonId);
      console.log("Save after delete result:", saveResult);
      
      // 2. Then, track the deletion with the new API
      const trackResult = await kanbanApi.trackCardUpdate(`Eliminato investitore: ${investorName}`, jsonId);
      console.log("Track deletion result:", trackResult);
    } catch (error) {
      console.error("Error saving after delete:", error);
      toast.error("Errore durante il salvataggio", {
        description: "Impossibile salvare le modifiche sul server dopo l'eliminazione. Riprova più tardi."
      });
    }
    
    toast.success("Investitore eliminato con successo");
  };

  return {
    editingInvestor,
    isModalOpen,
    handleEditInvestor,
    handleAddInvestor,
    handleSaveInvestor,
    handleDeleteInvestor,
    setIsModalOpen
  };
}
