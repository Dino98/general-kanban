import { Investor } from "@/utils/excelParser";
import { toast } from "sonner";

// Base API endpoints - updated to use the new domain
const BASE_URL = `https://www.momenteeria.it/jsonbin/index.php`;
const UPDATE_URL = `https://www.momenteeria.it/jsonbin/update.php`;

// CORS proxy URL
const CORS_PROXY = `https://api.allorigins.win/get?url=`;

// Maximum retry attempts for API calls
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // milliseconds

// Helper function for delaying retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate that all investor objects have required fields before saving
 * Returns true if valid, false if any required fields are missing
 */
const validateInvestorsData = (investors: Investor[]): boolean => {
  if (!Array.isArray(investors) || investors.length === 0) {
    console.error("Invalid investors data: not an array or empty");
    return false;
  }
  
  // Check each investor for required fields
  for (let i = 0; i < investors.length; i++) {
    const inv = investors[i];
    
    // Required fields must exist and have correct types
    if (!inv.id || typeof inv.id !== 'string') {
      console.error(`Invalid investor at index ${i}: missing id`);
      return false;
    }
    if (!inv.name || typeof inv.name !== 'string') {
      console.error(`Invalid investor at index ${i}: missing name`);
      return false;
    }
    if (typeof inv.type !== 'string') {
      console.error(`Invalid investor at index ${i}: missing type field`);
      return false;
    }
    if (typeof inv.description !== 'string') {
      console.error(`Invalid investor at index ${i}: missing description field`);
      return false;
    }
    if (!inv.status || typeof inv.status !== 'string') {
      console.error(`Invalid investor at index ${i}: missing status`);
      return false;
    }
    if (!inv.createdAt || typeof inv.createdAt !== 'string') {
      console.error(`Invalid investor at index ${i}: missing createdAt`);
      return false;
    }
    if (typeof inv.email !== 'string') {
      console.error(`Invalid investor at index ${i}: missing email field`);
      return false;
    }
    if (typeof inv.linkedin !== 'string') {
      console.error(`Invalid investor at index ${i}: missing linkedin field`);
      return false;
    }
    
    // Ensure optional number fields are either numbers or undefined
    if (inv.investmentMin !== undefined && typeof inv.investmentMin !== 'number') {
      console.error(`Invalid investor at index ${i}: investmentMin must be a number or undefined`);
      return false;
    }
    if (inv.investmentMax !== undefined && typeof inv.investmentMax !== 'number') {
      console.error(`Invalid investor at index ${i}: investmentMax must be a number or undefined`);
      return false;
    }
  }
  
  return true;
};

/**
 * Export investors data as a JSON file for download
 */
export const exportInvestorsAsJson = (investors: Investor[], jsonId?: string): void => {
  try {
    // Validate data before exporting
    if (!validateInvestorsData(investors)) {
      toast.error("Errore durante l'esportazione", {
        description: "I dati degli investitori sono incompleti o danneggiati. Impossibile esportare.",
        duration: 5000
      });
      return;
    }
    
    // Create a JSON blob from the investors data
    const jsonData = JSON.stringify(investors, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Use the provided JSON_ID as the filename
    link.download = `${jsonId || 'investors'}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Esportazione completata", {
      description: `${investors.length} investitori esportati in JSON`,
      duration: 3000
    });
  } catch (error) {
    console.error("Error exporting investors:", error);
    toast.error("Errore durante l'esportazione", {
      description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
      duration: 5000
    });
  }
};

/**
 * Service for API operations related to Kanban data
 */
export const kanbanApi = {
  /**
   * Save investors data to the server with retry logic using POST
   */
  saveInvestors: async (investors: Investor[], jsonId?: string): Promise<boolean> => {
    console.log("Saving investors to server", investors.length);
    
    if (!jsonId) {
      console.error("No JSON ID provided - aborting save");
      toast.error("Salvataggio annullato", {
        description: "Nessun ID progetto fornito. Imposta un ID nelle impostazioni.",
        duration: 5000
      });
      return false;
    }
    
    // Validate data before saving - CRITICAL CHECK
    if (!validateInvestorsData(investors)) {
      console.error("Invalid investor data - aborting save to prevent data loss");
      toast.error("Salvataggio annullato", {
        description: "I dati degli investitori sono incompleti. Il salvataggio è stato annullato per prevenire la perdita di dati.",
        duration: 5000
      });
      return false;
    }
    
    // Debugging: Log the full structure of the first investor to verify all fields
    if (investors.length > 0) {
      console.log("Sample investor structure being saved:", JSON.stringify(investors[0], null, 2));
    }
    
    let retries = 0;
    
    while (retries <= MAX_RETRIES) {
      try {
        // IMPORTANT: Ensure ALL fields are included by converting to full JSON string
        const jsonData = JSON.stringify(investors);
        console.log("Data prepared for sending, length:", jsonData.length);
        
        // Prepare the URL for the POST request
        const url = `${BASE_URL}?action=PUT&id=${jsonId}`;
        console.log("POST URL:", url);
        
        // Send the data directly as JSON in the request body with proper Content-Type
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonData, // Send complete JSON string with ALL fields directly in the body
        });
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error("Error response:", responseText);
          
          toast.error(`Errore dal server: ${response.status}`, { 
            description: `${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`,
            duration: 5000
          });
          
          throw new Error(`Server error: ${response.status} - ${responseText}`);
        }
        
        // Process the response
        const responseData = await response.text();
        console.log("Server response:", responseData);
        
        toast.success("Dati salvati con successo", {
          description: `${investors.length} investitori salvati con tutti i campi`,
          duration: 3000
        });
        
        console.log("Save successful");
        return true;
        
      } catch (error) {
        console.error(`Error saving investors (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
        
        if (retries === MAX_RETRIES) {
          toast.error("Salvataggio fallito", {
            description: `Impossibile salvare i dati dopo ${MAX_RETRIES + 1} tentativi. ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
            duration: 5000
          });
          return false;
        }
        
        await delay(RETRY_DELAY * (retries + 1));
        retries++;
      }
    }
    
    return false;
  },

  /**
   * Update metadata for the JSON document
   * This is called after card modifications to track changes
   */
  trackCardUpdate: async (note: string = "Aggiornato manualmente", jsonId?: string): Promise<boolean> => {
    console.log("Tracking card update with metadata:", note);
    
    if (!jsonId) {
      console.error("No JSON ID provided - aborting metadata update");
      return false;
    }
    
    try {
      // Create update URL with the JSON ID
      const url = `${UPDATE_URL}?id=${jsonId}`;
      console.log("Update metadata URL:", url);
      
      // Prepare the update data
      const updateData = {
        note: note,
        ultima_modifica: new Date().toISOString()
      };
      
      console.log("Sending update metadata:", updateData);
      
      // Send the update
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error response from update API:", responseText);
        throw new Error(`Server error during metadata update: ${response.status} - ${responseText}`);
      }
      
      // Process the response
      const responseData = await response.json();
      console.log("Metadata update response:", responseData);
      
      return true;
    } catch (error) {
      console.error("Error updating metadata:", error);
      return false;
    }
  },

  /**
   * Fetch investors data from the server with retry logic
   */
  getInvestors: async (jsonId?: string): Promise<Investor[] | null> => {
    if (!jsonId) {
      console.error("No JSON ID provided - aborting fetch");
      toast.warning("Caricamento annullato", {
        description: "Nessun ID progetto fornito. Imposta un ID nelle impostazioni.",
        duration: 5000
      });
      return [];
    }
    
    let retries = 0;
    
    // Create the GET URL with the JSON ID
    const getUrl = `${BASE_URL}?action=GET&id=${jsonId}`;
    // Use the CORS proxy for the GET request
    const proxyGetUrl = `${CORS_PROXY}${encodeURIComponent(getUrl)}`;
    
    console.log("Getting investors from URL (through proxy):", proxyGetUrl);
    
    while (retries <= MAX_RETRIES) {
      try {
        console.log(`Fetching data (attempt ${retries + 1})`);
        
        // Fetch through CORS proxy
        const response = await fetch(proxyGetUrl);
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error("Error response:", responseText);
          
          toast.error("Errore durante il caricamento dei dati", { 
            description: `Stato: ${response.status} - ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`,
            duration: 5000
          });
          
          throw new Error(`Server error: ${response.status} - ${responseText}`);
        }

        // Parse the proxy response first
        const proxyData = await response.json();
        console.log("Full proxy response:", proxyData);
        
        // Extract the actual data from the 'contents' property
        let jsonData;
        
        if (proxyData && proxyData.contents) {
          try {
            // Parse the contents string as JSON and log the complete structure
            jsonData = JSON.parse(proxyData.contents);
            console.log("Full parsed JSON from contents:", jsonData);
            
            // IMPORTANT: Debug and verify that all fields are present in the loaded data
            if (Array.isArray(jsonData) && jsonData.length > 0) {
              console.log("Sample investor from loaded data:", JSON.stringify(jsonData[0], null, 2));
            }
            
          } catch (parseError) {
            console.error("Error parsing contents as JSON:", parseError);
            // If contents is not valid JSON, use it as a string
            jsonData = proxyData.contents;
          }
        } else {
          jsonData = proxyData;
        }
        
        // Process the data and ENSURE all missing fields are initialized properly
        if (Array.isArray(jsonData)) {
          // Add missing fields to each investor if they don't exist
          const completeInvestors = jsonData.map((inv: any, index: number): Investor => {
            // Fix for investment fields that might be objects
            let investmentMin: number | undefined = undefined;
            let investmentMax: number | undefined = undefined;
            
            // Handle investment fields that may be objects with _type/value properties
            if (inv.investmentMin) {
              if (typeof inv.investmentMin === 'number') {
                investmentMin = inv.investmentMin;
              } else if (typeof inv.investmentMin === 'object' && inv.investmentMin._type === 'undefined') {
                investmentMin = undefined;
              } else if (typeof inv.investmentMin === 'object' && 'value' in inv.investmentMin) {
                const value = Number(inv.investmentMin.value);
                investmentMin = isNaN(value) ? undefined : value;
              }
            }
            
            if (inv.investmentMax) {
              if (typeof inv.investmentMax === 'number') {
                investmentMax = inv.investmentMax;
              } else if (typeof inv.investmentMax === 'object' && inv.investmentMax._type === 'undefined') {
                investmentMax = undefined;
              } else if (typeof inv.investmentMax === 'object' && 'value' in inv.investmentMax) {
                const value = Number(inv.investmentMax.value);
                investmentMax = isNaN(value) ? undefined : value;
              }
            }
            
            // Create a complete investor object with all required fields
            return {
              id: inv.id || `investor-${Date.now()}-${index}`,
              name: inv.name || 'Unnamed Investor',
              type: inv.type || '',
              description: inv.description || '', // Ensure description is always initialized at least as empty string
              status: inv.status || 'Da contattare',
              investmentMin: investmentMin,
              investmentMax: investmentMax,
              createdAt: inv.createdAt || new Date().toISOString(),
              email: inv.email || '',
              linkedin: inv.linkedin || ''
            };
          });
          
          console.log("Loaded and completed investors from server:", completeInvestors.length, "First investor sample:", completeInvestors[0]);
          
          toast.success("Dati caricati con successo", {
            description: `${completeInvestors.length} investitori caricati con tutti i campi`,
            duration: 3000
          });
          
          return completeInvestors;
        } else if (jsonData && typeof jsonData === 'object' && 'data' in jsonData && Array.isArray(jsonData.data)) {
          // Similar completion for nested data array
          const completeInvestors = jsonData.data.map((inv: any, index: number): Investor => {
            // Fix for investment fields that might be objects
            let investmentMin: number | undefined = undefined;
            let investmentMax: number | undefined = undefined;
            
            // Handle investment fields that may be objects with _type/value properties
            if (inv.investmentMin) {
              if (typeof inv.investmentMin === 'number') {
                investmentMin = inv.investmentMin;
              } else if (typeof inv.investmentMin === 'object' && inv.investmentMin._type === 'undefined') {
                investmentMin = undefined;
              } else if (typeof inv.investmentMin === 'object' && 'value' in inv.investmentMin) {
                const value = Number(inv.investmentMin.value);
                investmentMin = isNaN(value) ? undefined : value;
              }
            }
            
            if (inv.investmentMax) {
              if (typeof inv.investmentMax === 'number') {
                investmentMax = inv.investmentMax;
              } else if (typeof inv.investmentMax === 'object' && inv.investmentMax._type === 'undefined') {
                investmentMax = undefined;
              } else if (typeof inv.investmentMax === 'object' && 'value' in inv.investmentMax) {
                const value = Number(inv.investmentMax.value);
                investmentMax = isNaN(value) ? undefined : value;
              }
            }
            
            return {
              id: inv.id || `investor-${Date.now()}-${index}`,
              name: inv.name || 'Unnamed Investor',
              type: inv.type || '',
              description: inv.description || '', // Ensure description is initialized
              status: inv.status || 'Da contattare',
              investmentMin: investmentMin,
              investmentMax: investmentMax,
              createdAt: inv.createdAt || new Date().toISOString(),
              email: inv.email || '',
              linkedin: inv.linkedin || ''
            };
          });
          
          console.log("Found and completed array at key 'data', length:", completeInvestors.length);
          
          toast.success("Dati caricati con successo", {
            description: `${completeInvestors.length} investitori caricati con tutti i campi`,
            duration: 3000
          });
          
          return completeInvestors;
        } else {
          // Add additional property checks for arrays in any property
          for (const key in jsonData) {
            if (Array.isArray(jsonData[key])) {
              const completeInvestors = jsonData[key].map((inv: any, index: number): Investor => {
                return {
                  id: inv.id || `investor-${Date.now()}-${index}`,
                  name: inv.name || 'Unnamed Investor',
                  type: inv.type || '',
                  description: inv.description || '', // Ensure description is initialized
                  status: inv.status || 'Da contattare',
                  investmentMin: typeof inv.investmentMin === 'number' ? inv.investmentMin : undefined,
                  investmentMax: typeof inv.investmentMax === 'number' ? inv.investmentMax : undefined,
                  createdAt: inv.createdAt || new Date().toISOString(),
                  email: inv.email || '',
                  linkedin: inv.linkedin || ''
                };
              });
              
              console.log(`Found and completed array at key "${key}", length:`, completeInvestors.length);
              
              toast.success("Dati caricati con successo", {
                description: `${completeInvestors.length} investitori caricati con tutti i campi`,
                duration: 3000
              });
              
              return completeInvestors;
            }
          }
          
          // Handle single investor case
          if (jsonData && typeof jsonData === 'object' && 'id' in jsonData) {
            const completeInvestor: Investor = {
              id: jsonData.id || `investor-${Date.now()}-0`,
              name: jsonData.name || 'Unnamed Investor',
              type: jsonData.type || '',
              description: jsonData.description || '', // Ensure description is initialized
              status: jsonData.status || 'Da contattare',
              investmentMin: typeof jsonData.investmentMin === 'number' ? jsonData.investmentMin : undefined,
              investmentMax: typeof jsonData.investmentMax === 'number' ? jsonData.investmentMax : undefined,
              createdAt: jsonData.createdAt || new Date().toISOString(),
              email: jsonData.email || '',
              linkedin: jsonData.linkedin || ''
            };
            
            console.log("Found and completed single investor object:", completeInvestor);
            
            toast.success("Dati caricati con successo", {
              description: "1 investitore caricato con tutti i campi",
              duration: 3000
            });
            
            return [completeInvestor];
          }
          
          // Return empty array as fallback
          if (jsonData && typeof jsonData === 'object') {
            console.warn("Response is not an array but a valid object. Returning empty array.");
            
            toast.warning("Formato dati non riconosciuto", {
              description: "Il server ha risposto con un formato valido ma non riconosciuto. Array vuoto caricato.",
              duration: 4000
            });
            
            return [];
          }
          
          console.error("Unexpected response format:", jsonData);
          
          toast.error("Formato dati non valido", {
            description: "Il server ha risposto con un formato non valido. Controllare la console per dettagli.",
            duration: 4000
          });
          
          throw new Error("Unexpected response format from server");
        }
      } catch (error) {
        console.error(`Error loading investors (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
        
        if (retries === MAX_RETRIES) {
          toast.error("Caricamento dati fallito", {
            description: `Impossibile caricare i dati dopo ${MAX_RETRIES + 1} tentativi. ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
            duration: 5000
          });
          
          // On final retry failure, return empty array
          console.warn("All fetch attempts failed. Returning empty array.");
          return [];
        }
        
        // Wait before retrying
        await delay(RETRY_DELAY * (retries + 1));
        retries++;
      }
    }
    
    return [];
  }
};
