
import { useRef, useState } from "react";
import { Investor, InvestorStatus } from "@/utils/excelParser";
import { toast } from "sonner";
import { kanbanApi } from "@/services/api";

interface UseDragAndDropProps {
  investors: Investor[];
  onUpdateInvestors: (investors: Investor[]) => void;
  dropZoneRef?: React.RefObject<HTMLDivElement>;
}

export function useDragAndDrop({ investors, onUpdateInvestors, dropZoneRef }: UseDragAndDropProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingRef = useRef<HTMLElement | null>(null);
  const dragSourceStatusRef = useRef<string | null>(null);

  // Helper function to save investors data after updates
  const saveInvestorsToServer = async (updatedInvestors: Investor[]) => {
    console.log("Saving after drag and drop...");
    try {
      await kanbanApi.saveInvestors(updatedInvestors);
    } catch (error) {
      console.error("Error saving after drag and drop:", error);
      // Toast notifications are handled by the API service
    }
  };

  const handleDragStart = (e: DragEvent) => {
    if (!(e.target instanceof HTMLElement)) return;
    
    const cardElement = e.target.closest('.card') as HTMLElement;
    if (!cardElement) return;
    
    // Store reference to dragging element
    draggingRef.current = cardElement;
    setDraggingId(cardElement.dataset.investorId || null);
    
    // Store source column status
    const sourceColumn = cardElement.closest('[data-status]') as HTMLElement;
    if (sourceColumn) {
      dragSourceStatusRef.current = sourceColumn.dataset.status || null;
    }
    
    // Visual feedback
    setTimeout(() => {
      if (cardElement) {
        cardElement.classList.add('opacity-50');
      }
    }, 0);
    
    // Set data transfer
    e.dataTransfer?.setData('text/plain', cardElement.dataset.investorId || '');
  };
  
  const handleDragEnd = (e: DragEvent) => {
    if (!(e.target instanceof HTMLElement)) return;
    
    // Reset opacity
    document.querySelectorAll('.card').forEach(card => {
      (card as HTMLElement).classList.remove('opacity-50');
    });
    
    // Always hide delete zone when drag ends
    if (dropZoneRef?.current) {
      dropZoneRef.current.classList.remove('active');
      dropZoneRef.current.classList.remove('drag-over');
    }
    
    // Clean up refs
    draggingRef.current = null;
    dragSourceStatusRef.current = null;
    setDraggingId(null);
  };
  
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    
    if (!(e.target instanceof HTMLElement)) return;
    
    // Check if dragging over delete zone
    const isOverDeleteZone = e.target.closest('#droppable-delete-zone') || 
                             e.target.id === 'droppable-delete-zone';
    
    if (isOverDeleteZone && dropZoneRef?.current) {
      dropZoneRef.current.classList.add('drag-over');
      return;
    } else if (dropZoneRef?.current) {
      dropZoneRef.current.classList.remove('drag-over');
    }
    
    // Find the closest droppable container
    const container = e.target.closest('[id^="droppable-"]') as HTMLElement;
    if (!container) return;
    
    // Visual feedback for droppable area
    container.classList.add('bg-primary/5');

    // Handle within-column reordering - show insertion point between cards
    const cardElement = e.target.closest('.card') as HTMLElement;
    if (cardElement && container) {
      // Only proceed if we're within a column and have both a target card and a dragged card
      if (draggingId && draggingId !== cardElement.dataset.investorId) {
        const rect = cardElement.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        // Remove all insertion markers
        container.querySelectorAll('.insertion-above, .insertion-below').forEach(el => {
          el.classList.remove('insertion-above', 'insertion-below');
        });
        
        // Add appropriate insertion marker based on mouse position
        if (e.clientY < midpoint) {
          cardElement.classList.add('insertion-above');
        } else {
          cardElement.classList.add('insertion-below');
        }
      }
    }
  };
  
  const handleDragLeave = (e: DragEvent) => {
    if (!(e.target instanceof HTMLElement)) return;
    
    // Check if leaving delete zone
    const isDeleteZone = e.target.closest('#droppable-delete-zone') || 
                         e.target.id === 'droppable-delete-zone';
    
    if (isDeleteZone && dropZoneRef?.current) {
      dropZoneRef.current.classList.remove('drag-over');
    }
    
    // Find the closest droppable container
    const container = e.target.closest('[id^="droppable-"]') as HTMLElement;
    if (!container) return;
    
    // Reset visual feedback
    container.classList.remove('bg-primary/5');
    
    // Remove insertion markers when leaving cards
    const cardElement = e.target.closest('.card') as HTMLElement;
    if (cardElement) {
      cardElement.classList.remove('insertion-above', 'insertion-below');
    }
  };
  
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    
    // Always hide the delete zone on any drop operation
    if (dropZoneRef?.current) {
      dropZoneRef.current.classList.remove('active');
      dropZoneRef.current.classList.remove('drag-over');
    }
    
    // Make sure the target is an HTMLElement
    if (!(e.target instanceof HTMLElement)) return;
    
    // Check if dropping on delete zone
    const isDeleteZone = e.target.closest('#droppable-delete-zone') || 
                         e.target.id === 'droppable-delete-zone';
    
    // Get dragged card ID
    const investorId = e.dataTransfer?.getData('text/plain') || draggingId;
    
    console.log("Handling drop, investor ID:", investorId, "isDeleteZone:", isDeleteZone);
    
    if (!investorId) {
      console.error("No investor ID found during drop");
      return;
    }
    
    if (isDeleteZone) {
      console.log("Dropping in delete zone, investor ID:", investorId);
      
      // Find the investor to make sure it exists before updating
      const investorToUpdate = investors.find(inv => inv.id === investorId);
      if (!investorToUpdate) {
        console.error("Investor not found:", investorId);
        return;
      }
      
      console.log("Found investor to update:", investorToUpdate);
      
      // Create a new array with the updated investor
      const updatedInvestors = investors.map(investor => {
        if (investor.id === investorId) {
          return { ...investor, status: "Drop definitivo" as InvestorStatus };
        }
        return investor;
      });
      
      console.log("Updated investors array:", updatedInvestors);
      
      // Call the update function
      onUpdateInvestors(updatedInvestors);
      
      // Save to server immediately after a successful drop
      saveInvestorsToServer(updatedInvestors);
      
      // Show toast notification
      toast.success("Opportunità spostata in \"Drop definitivo\"");
      
      return;
    }
    
    // Find the closest droppable container
    const container = e.target.closest('[id^="droppable-"]') as HTMLElement;
    if (!container) {
      console.error("No droppable container found");
      return;
    }
    
    // Reset visual feedback
    container.classList.remove('bg-primary/5');
    
    // Get target column status
    const targetColumn = container.closest('[data-status]') as HTMLElement;
    if (!targetColumn || !dragSourceStatusRef.current) {
      console.error("No target column or source status found");
      return;
    }
    
    const targetStatus = targetColumn.dataset.status;
    if (!targetStatus) return;
    
    // Find the dragged investor
    const draggedInvestor = investors.find(inv => inv.id === investorId);
    if (!draggedInvestor) {
      console.error("Dragged investor not found");
      return;
    }

    // Handle within-column reordering
    const targetCardElement = e.target.closest('.card') as HTMLElement;
    if (targetCardElement && targetStatus === dragSourceStatusRef.current) {
      const targetInvestorId = targetCardElement.dataset.investorId;
      if (!targetInvestorId || targetInvestorId === investorId) return;
      
      // Find out if we're dropping above or below the target
      const isAbove = targetCardElement.classList.contains('insertion-above');
      
      // Create a copy of investors to reorder
      let reorderedInvestors = [...investors];
      
      // Remove the dragged investor from the array
      reorderedInvestors = reorderedInvestors.filter(inv => inv.id !== investorId);
      
      // Find the index of the target investor
      const targetIndex = reorderedInvestors.findIndex(inv => inv.id === targetInvestorId);
      
      // Insert the dragged investor at the appropriate position
      if (isAbove) {
        reorderedInvestors.splice(targetIndex, 0, draggedInvestor);
      } else {
        reorderedInvestors.splice(targetIndex + 1, 0, draggedInvestor);
      }
      
      // Update investors
      onUpdateInvestors(reorderedInvestors);
      
      // Save to server
      saveInvestorsToServer(reorderedInvestors);
      
      // Show toast notification
      toast.success("Ordine aggiornato");
      
      // Remove all insertion markers
      document.querySelectorAll('.insertion-above, .insertion-below').forEach(el => {
        el.classList.remove('insertion-above', 'insertion-below');
      });
      
      return;
    }
    
    // For column changes (not reordering)
    if (targetStatus !== dragSourceStatusRef.current) {
      // Update investor status
      const updatedInvestors = investors.map(investor => {
        if (investor.id === investorId) {
          return { ...investor, status: targetStatus as InvestorStatus };
        }
        return investor;
      });
      
      onUpdateInvestors(updatedInvestors);
      
      // Save to server immediately after a successful drop
      saveInvestorsToServer(updatedInvestors);
      
      // Show toast notification
      toast.success(`Investitore spostato in "${targetStatus}"`);
    }
  };

  return {
    draggingId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
