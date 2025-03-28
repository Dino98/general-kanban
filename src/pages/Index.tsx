import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ImportBox from "@/components/ImportBox";
import KanbanBoard from "@/components/KanbanBoard";
import Analytics from "@/components/Analytics";
import Settings from "@/components/Settings";
import { Investor } from "@/utils/excelParser";
import { cn } from "@/lib/utils";
import { kanbanApi, exportInvestorsAsJson } from "@/services/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activeView, setActiveView] = useState<"board" | "analytics" | "settings">("board");
  const [hasImportedData, setHasImportedData] = useState(false);
  const [showDropped, setShowDropped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  // Flag to prevent auto-saving immediately after loading data
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  // State for JSON ID
  const [jsonId, setJsonId] = useState<string>("");
  // Get URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Immediately check for ID in URL on first render and load data if it exists
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      console.log("Found ID in URL:", idFromUrl);
      setJsonId(idFromUrl);
      loadInvestorsData(idFromUrl); // Immediately load data when ID is present
    } else {
      setIsLoading(false); // Not loading if no ID
    }
  }, [searchParams]);

  // Separate function to load investor data
  const loadInvestorsData = async (id: string) => {
    setIsLoading(true);
    setLoadingError(null);
    setLoadingProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress < 90 ? newProgress : prev;
      });
    }, 300);
    
    try {
      console.log("Loading investors from server with ID:", id);
      const serverData = await kanbanApi.getInvestors(id);
      
      if (serverData && serverData.length > 0) {
        console.log("Loaded investors from server:", serverData.length);
        setInvestors(serverData);
        setHasImportedData(true);
      } else {
        console.log("No data found on server or empty array returned");
        setInvestors([]);
        setHasImportedData(false);
      }
      
      // Complete the progress
      setLoadingProgress(100);
      // Mark initial load as complete to allow future auto-saves
      setInitialLoadComplete(true);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoadingError("Impossibile caricare i dati dal server. Riprova più tardi.");
      setInvestors([]);
      setHasImportedData(false);
      setLoadingProgress(100);
      // Even on error, mark load as complete
      setInitialLoadComplete(true);
    } finally {
      clearInterval(progressInterval);
      // Delay hiding the loading screen to show 100% completion
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleImport = async (importedInvestors: Investor[]) => {
    console.log("Importing investors:", importedInvestors.length);
    setInvestors(importedInvestors);
    setHasImportedData(true);
    
    // Save to server without redundant notification (API will show toast)
    try {
      await kanbanApi.saveInvestors(importedInvestors, jsonId);
      // Toast notifications now handled by the API service
    } catch (error) {
      console.error("Error saving imported data:", error);
      // Error notifications now handled by the API service
    }
  };

  const handleUpdateInvestors = (updatedInvestors: Investor[]) => {
    console.log("Updating investors:", updatedInvestors.length);
    setInvestors(updatedInvestors);
    // Note: saving to server is handled by the useKanbanStorage hook
  };

  // Log investor data when it changes, or when view changes to analytics
  useEffect(() => {
    if (activeView === "analytics") {
      console.log("Analytics view with investors:", investors.length);
      console.log("Investor status distribution:", 
        investors.reduce((acc, inv) => {
          acc[inv.status] = (acc[inv.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      );
    }
  }, [activeView, investors]);

  const handleExportJson = () => {
    if (investors.length === 0) {
      toast.warning("Nessun dato da esportare", {
        description: "Importa prima i dati degli investitori",
        duration: 3000
      });
      return;
    }
    
    exportInvestorsAsJson(investors);
  };
  
  const handleSetJsonId = (id: string) => {
    setJsonId(id);
    // Update URL with the new ID
    setSearchParams({ id });
    // Immediately load data with the new ID
    loadInvestorsData(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/90 flex items-center justify-center">
        <div className="text-center w-full max-w-md px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-opacity-50 mx-auto mb-4"></div>
          <p className="text-lg font-medium mb-4">Caricamento dati dal server...</p>
          <Progress value={loadingProgress} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">{Math.round(loadingProgress)}%</p>
          {loadingError && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {loadingError}
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Ricarica
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        showDropped={showDropped}
        onToggleShowDropped={setShowDropped}
        hasData={hasImportedData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="w-full px-4 py-4">
        {!hasImportedData && activeView === "board" && !jsonId && (
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Nessun ID progetto configurato</h2>
              <p className="text-muted-foreground mb-4">Vai nelle impostazioni per generare o caricare un ID progetto</p>
              <Button 
                onClick={() => setActiveView("settings")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Vai alle Impostazioni
              </Button>
            </div>
          </div>
        )}
        
        {!hasImportedData && activeView === "board" && jsonId && (
          <div className="container mx-auto">
            <ImportBox onImport={handleImport} />
          </div>
        )}
        
        <div className={cn(
          "transition-all duration-500 w-full h-full",
          activeView === "board" ? "block" : "hidden"
        )}>
          {hasImportedData && (
            <KanbanBoard 
              investors={investors} 
              onUpdateInvestors={handleUpdateInvestors}
              showDropped={showDropped}
              initialLoadComplete={initialLoadComplete}
              searchQuery={searchQuery}
              jsonId={jsonId} // Make sure to pass jsonId to KanbanBoard
            />
          )}
        </div>
        
        <div className={cn(
          "transition-all duration-500 container mx-auto",
          activeView === "analytics" ? "block" : "hidden"
        )}>
          <Analytics investors={investors} />
        </div>
        
        <div className={cn(
          "transition-all duration-500 container mx-auto",
          activeView === "settings" ? "block" : "hidden"
        )}>
          <Settings 
            onImport={handleImport} 
            onExportJson={handleExportJson}
            hasData={investors.length > 0}
            jsonId={jsonId}
            onSetJsonId={handleSetJsonId}
            investors={investors} // Pass investors to Settings
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
