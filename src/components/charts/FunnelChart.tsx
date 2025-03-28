
import React from "react";
import { ChartContainer } from "../ui/chart";
import { ArrowDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FunnelChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage?: string;
    fill: string;
    conversionRate?: string;
    dropRate?: string;
    labelValue?: string;
  }>;
  tooltipFormatter?: (value: number, name: string, props: any) => React.ReactNode;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ 
  data,
  tooltipFormatter 
}) => {
  const isMobile = useIsMobile();
  
  // Process data - ensure this runs for every render
  const processedData = data ? data.map(item => ({
    ...item,
    value: typeof item.value === 'string' ? parseInt(item.value, 10) : item.value
  })) : [];
  
  // Config for our chart - use simple numbers
  const config = {
    '0': { label: 'Da contattare', color: '#8B5CF6' },
    '1': { label: 'Contattati', color: '#0EA5E9' },
    '2': { label: 'Interessati', color: '#10B981' },
    '3': { label: 'Negoziazione', color: '#F59E0B' },
    '4': { label: 'A bordo!', color: '#EC4899' }
  };

  // Customize the bar's width to match the funnel visualization
  const getBarWidth = (value: number, index: number) => {
    if (!processedData.length) return "0%";
    
    const maxValue = Math.max(...processedData.map(item => item.value));
    if (maxValue === 0) return "0%";
    
    // Calculate percentages for a funnel shape
    // First item is widest, then gradually decrease width
    const percentage = value / maxValue;
    
    // Start from 100% width and decrease by stage position
    // This creates a funnel effect where top is widest
    const stageFactor = 1 - (index * 0.12); // Gradually decrease width by stage
    
    return `${percentage * 100 * stageFactor}%`;
  };

  // Check if we have valid data to display
  const hasData = processedData && processedData.length > 0;
  const hasValidData = hasData && processedData.some(item => item.value > 0);

  // If no data or all values are zero, show placeholder
  if (!hasData) {
    return <div className="p-8 text-center text-muted-foreground">Nessun dato disponibile</div>;
  }

  if (!hasValidData) {
    return <div className="p-8 text-center text-muted-foreground">Non ci sono dati sufficienti per visualizzare il grafico</div>;
  }

  return (
    <div className="w-full">
      <ChartContainer config={config} className="w-full">
        <div className="grid grid-cols-1 gap-4">
          {processedData.map((item, index) => (
            <div key={`funnel-${index}`} className="relative">
              {/* Stage header */}
              <div className="text-center mb-1">
                <div className={`text-lg font-medium ${isMobile ? "text-sm" : ""}`}>{item.name}</div>
                <div className={`text-2xl font-bold ${isMobile ? "text-xl" : ""}`}>{item.value.toLocaleString()}</div>
                {item.percentage && (
                  <div className="text-sm text-muted-foreground">{item.percentage}% del totale</div>
                )}
              </div>
              
              {/* Bar visualization - centered with mx-auto */}
              <div className="h-16 bg-gray-100 rounded-md overflow-hidden flex justify-center">
                <div 
                  className="h-full transition-all duration-500 ease-in-out rounded-md flex items-center justify-center"
                  style={{ 
                    width: getBarWidth(item.value, index),
                    backgroundColor: item.fill,
                    maxWidth: "100%"
                  }}
                >
                  <span className="text-white font-medium text-sm px-2 truncate">
                    {item.value}
                  </span>
                </div>
              </div>
              
              {/* Conversion arrow and rate */}
              {index < processedData.length - 1 && (
                <div className="flex justify-center items-center my-2">
                  <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    <span className={isMobile ? "text-xs" : ""}>
                      {item.conversionRate}% conversione
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
};

export default FunnelChart;
