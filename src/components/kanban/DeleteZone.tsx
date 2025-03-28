
import React, { RefObject } from "react";
import { Trash2 } from "lucide-react";

interface DeleteZoneProps {
  deleteOverlayRef: RefObject<HTMLDivElement>;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropComplete?: () => void;
}

const DeleteZone: React.FC<DeleteZoneProps> = ({ deleteOverlayRef, onDrop, onDropComplete }) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(e);
    
    // Hide the delete zone after drop
    if (onDropComplete) {
      onDropComplete();
    }
  };

  return (
    <div 
      ref={deleteOverlayRef}
      id="droppable-delete-zone"
      className="delete-drop-overlay"
      data-delete-zone="true"
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
      }}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-2 text-white">
        <Trash2 className="h-12 w-12 mb-2" />
        <span className="text-xl font-bold uppercase">ELIMINA OPPORTUNITÀ</span>
      </div>
    </div>
  );
};

export default DeleteZone;
