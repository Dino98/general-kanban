
import { useState, useRef, RefObject } from "react";

export function useDragState() {
  const [isDragging, setIsDragging] = useState(false);
  const deleteOverlayRef = useRef<HTMLDivElement>(null);

  const handleDragStartCustom = (e: DragEvent, handleDragStart?: (e: DragEvent) => void) => {
    setIsDragging(true);
    if (deleteOverlayRef.current) {
      deleteOverlayRef.current.classList.add('active');
    }
    if (handleDragStart) handleDragStart(e);
  };

  const handleDragEndCustom = (e: DragEvent, handleDragEnd?: (e: DragEvent) => void) => {
    setIsDragging(false);
    // Ensure the delete zone is hidden when drag ends
    hideDeleteZone();
    if (handleDragEnd) handleDragEnd(e);
  };

  // Function to hide the delete zone
  const hideDeleteZone = () => {
    if (deleteOverlayRef.current) {
      deleteOverlayRef.current.classList.remove('active');
      deleteOverlayRef.current.classList.remove('drag-over');
    }
    setIsDragging(false);
  };

  return {
    isDragging,
    deleteOverlayRef,
    handleDragStartCustom,
    handleDragEndCustom,
    hideDeleteZone
  };
}
