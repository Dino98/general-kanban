
import { useEffect, useRef } from "react";
import { Investor } from "@/utils/excelParser";
import { kanbanApi } from "@/services/api";
import { toast } from "sonner";

/**
 * Verify that all required fields are present in all investors
 */
const isCompleteInvestorsData = (investors: Investor[]): boolean => {
  if (!Array.isArray(investors) || investors.length === 0) return true; // Empty array is valid
  
  return investors.every(inv => 
    inv.id && 
    inv.name && 
    typeof inv.type === 'string' &&
    typeof inv.description === 'string' &&
    inv.status &&
    inv.createdAt &&
    typeof inv.email === 'string' &&
    typeof inv.linkedin === 'string'
  );
};

export function useKanbanStorage(
  investors: Investor[],
  onUpdateInvestors: (investors: Investor[]) => void,
  initialLoadComplete: boolean = false,
  jsonId?: string
) {
  // Use a ref to track if we're in the process of saving
  const isSavingRef = useRef(false);
  // Use a ref to store the timeout ID for cleanup
  const timeoutRef = useRef<number | null>(null);
  // Track the last saved data to avoid unnecessary saves
  const lastSavedDataRef = useRef<string>("");
  
  // Save data when investors change
  useEffect(() => {
    // Don't save if:
    // 1. There are no investors
    // 2. We're already saving
    // 3. Initial loading is not complete - this prevents overwriting on initial load
    // 4. Data is not complete (missing required fields)
    // 5. No JSON ID is provided
    if (investors.length === 0 || isSavingRef.current || !initialLoadComplete || !jsonId) {
      console.log("Skipping auto-save because:", 
        investors.length === 0 ? "no investors" : 
        isSavingRef.current ? "already saving" : 
        !initialLoadComplete ? "initial load not complete" : 
        !jsonId ? "no JSON ID provided" :
        "unknown reason"
      );
      return;
    }
    
    // CRITICAL: Check if data is complete before saving
    if (!isCompleteInvestorsData(investors)) {
      console.error("Incomplete investor data detected - auto-save prevented to avoid data loss");
      toast.error("Auto-salvataggio impedito", {
        description: "I dati degli investitori sono incompleti. L'auto-salvataggio è stato impedito per prevenire la perdita di dati.",
        duration: 5000
      });
      return;
    }
    
    // Check if the data has actually changed
    const currentData = JSON.stringify(investors);
    if (currentData === lastSavedDataRef.current) {
      console.log("Data unchanged, skipping save");
      return;
    }
    
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    
    // Use a timeout to debounce frequent saves
    timeoutRef.current = window.setTimeout(async () => {
      isSavingRef.current = true;
      
      try {
        console.log("Auto-saving investors data to server...");
        const success = await kanbanApi.saveInvestors(investors, jsonId);
        
        if (success) {
          console.log("Auto-save successful");
          // Update the last saved data reference
          lastSavedDataRef.current = currentData;
        }
      } catch (error) {
        console.error("Error during auto-save:", error);
      } finally {
        isSavingRef.current = false;
      }
    }, 2000); // 2 second debounce
    
    // Cleanup function
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [investors, initialLoadComplete, jsonId]);

  return {
    saveToStorage: async () => {
      if (!jsonId) {
        toast.error("Salvataggio non possibile", {
          description: "Nessun ID progetto fornito. Imposta un ID nelle impostazioni.",
          duration: 5000
        });
        return false;
      }
      
      if (investors.length > 0) {
        // CRITICAL: Check if data is complete before manual save
        if (!isCompleteInvestorsData(investors)) {
          console.error("Incomplete investor data detected - manual save prevented to avoid data loss");
          toast.error("Salvataggio impedito", {
            description: "I dati degli investitori sono incompleti. Il salvataggio è stato impedito per prevenire la perdita di dati.",
            duration: 5000
          });
          return false;
        }
        
        // Set saving flag to prevent duplicate saves
        isSavingRef.current = true;
        
        try {
          const success = await kanbanApi.saveInvestors(investors, jsonId);
          if (success) {
            // Update the last saved data reference on successful save
            lastSavedDataRef.current = JSON.stringify(investors);
          }
          return success;
        } catch (error) {
          console.error("Error saving to storage:", error);
          return false;
        } finally {
          isSavingRef.current = false;
        }
      }
      return false;
    }
  };
}
