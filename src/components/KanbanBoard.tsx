
import React, { useRef, useEffect, useState } from "react";
import { Investor } from "@/utils/excelParser";
import KanbanColumn from "@/components/KanbanColumn";
import EditModal from "@/components/EditModal";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { COLUMN_COLORS, INVESTOR_STATUSES } from "@/constants/kanbanConstants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKanbanStorage } from "@/hooks/useKanbanStorage";
import { useInvestorActions } from "@/hooks/useInvestorActions";
import { useDragState } from "@/hooks/useDragState";
import DeleteZone from "@/components/kanban/DeleteZone";

interface KanbanBoardProps {
  investors: Investor[];
  onUpdateInvestors: (investors: Investor[]) => void;
  showDropped: boolean;
  initialLoadComplete?: boolean;
  searchQuery?: string;
  jsonId?: string; // Keep jsonId prop in the interface
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  investors, 
  onUpdateInvestors,
  showDropped,
  initialLoadComplete = false,
  searchQuery = "",
  jsonId // Keep jsonId in the destructured props
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Use the drag state hook
  const {
    isDragging,
    deleteOverlayRef,
    handleDragStartCustom,
    handleDragEndCustom,
    hideDeleteZone
  } = useDragState();
  
  // Use the storage hook, passing the initialLoadComplete flag and jsonId
  useKanbanStorage(investors, onUpdateInvestors, initialLoadComplete, jsonId);
  
  // Use the investor actions hook with jsonId
  const {
    editingInvestor,
    isModalOpen,
    handleEditInvestor,
    handleAddInvestor,
    handleSaveInvestor,
    handleDeleteInvestor,
    setIsModalOpen
  } = useInvestorActions(investors, onUpdateInvestors, jsonId);

  // Use the drag and drop hook
  const { 
    draggingId,
    handleDragStart,
    handleDragEnd, 
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop({ 
    investors, 
    onUpdateInvestors,
    dropZoneRef: deleteOverlayRef
  });

  // Filter investors based on search query
  const filteredInvestors = searchQuery.trim() === "" 
    ? investors 
    : investors.filter(investor => {
        const searchLower = searchQuery.toLowerCase();
        // Search in multiple fields
        return (
          investor.name.toLowerCase().includes(searchLower) ||
          (investor.type && investor.type.toLowerCase().includes(searchLower)) ||
          (investor.description && investor.description.toLowerCase().includes(searchLower)) ||
          (investor.email && investor.email.toLowerCase().includes(searchLower))
        );
      });

  // Get visible statuses based on showDropped state
  const visibleStatuses = INVESTOR_STATUSES.filter(status => 
    showDropped || status !== "Drop definitivo"
  );

  // Setup event listeners on the board
  useEffect(() => {
    const board = boardRef.current;
    if (board) {
      // Use the custom drag handlers that incorporate delete zone management
      board.addEventListener('dragstart', (e) => handleDragStartCustom(e, handleDragStart));
      board.addEventListener('dragend', (e) => handleDragEndCustom(e, handleDragEnd));
      board.addEventListener('dragover', handleDragOver);
      board.addEventListener('dragleave', handleDragLeave);
      board.addEventListener('drop', handleDrop);
    }
    
    // Clean up event listeners
    return () => {
      if (board) {
        board.removeEventListener('dragstart', (e) => handleDragStartCustom(e, handleDragStart));
        board.removeEventListener('dragend', (e) => handleDragEndCustom(e, handleDragEnd));
        board.removeEventListener('dragover', handleDragOver);
        board.removeEventListener('dragleave', handleDragLeave);
        board.removeEventListener('drop', handleDrop);
      }
    };
  }, [investors, onUpdateInvestors, draggingId]);

  // Add CSS for the insertion indicators as a style tag
  useEffect(() => {
    // Add global style for insertion indicators
    const style = document.createElement('style');
    style.textContent = `
      .card.insertion-above {
        border-top: 2px dashed #7c3aed !important;
        margin-top: 4px;
      }
      .card.insertion-below {
        border-bottom: 2px dashed #7c3aed !important;
        margin-bottom: 4px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="py-8 overflow-x-auto w-full h-full pr-4 pb-4 flex flex-col relative">
      <div 
        ref={boardRef}
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 w-full h-full`}
      >
        {visibleStatuses.map((status, index) => {
          // Find the original index in INVESTOR_STATUSES to get the right color
          const originalIndex = INVESTOR_STATUSES.findIndex(s => s === status);
          return (
            <KanbanColumn
              key={status}
              title={status}
              status={status}
              investors={filteredInvestors}
              onEditInvestor={handleEditInvestor}
              onDeleteInvestor={handleDeleteInvestor}
              onAddInvestor={handleAddInvestor}
              backgroundColor={COLUMN_COLORS[originalIndex]}
              animationDelay={`animate-in-delayed-${index + 1}`}
            />
          );
        })}
      </div>
      
      {/* Delete Drop Overlay */}
      <DeleteZone 
        deleteOverlayRef={deleteOverlayRef}
        onDrop={handleDrop as any}
        onDropComplete={hideDeleteZone}
      />
      
      <EditModal
        investor={editingInvestor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvestor}
        allInvestors={investors} // Pass all investors to EditModal
      />
    </div>
  );
};

export default KanbanBoard;
