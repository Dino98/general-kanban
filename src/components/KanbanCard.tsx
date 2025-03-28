
import React from "react";
import { cn } from "@/lib/utils";
import { Investor } from "@/utils/excelParser";
import { EuroIcon, Trash2Icon, Mail, Linkedin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanCardProps {
  investor: Investor;
  onEdit: (investor: Investor) => void;
  onDelete?: (investorId: string) => void;
  className?: string;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ 
  investor, 
  onEdit,
  onDelete,
  className 
}) => {
  // Format investment values to display in a readable format with thousand separators
  const formatInvestment = (value: number | undefined) => {
    if (value === undefined) return "";
    
    // Format based on the value size
    if (value >= 1000000) {
      return `${(value / 1000000).toLocaleString('it-IT', {maximumFractionDigits: 1})}M€`;
    } else if (value >= 1000) {
      return `${(value / 1000).toLocaleString('it-IT', {maximumFractionDigits: 0})}K€`;
    }
    return `${value.toLocaleString('it-IT')}€`;
  };

  // Prepare investment range text
  const investmentText = () => {
    if (investor.investmentMin !== undefined && investor.investmentMax !== undefined) {
      return `${formatInvestment(investor.investmentMin)} - ${formatInvestment(investor.investmentMax)}`;
    } else if (investor.investmentMin !== undefined) {
      return `Min: ${formatInvestment(investor.investmentMin)}`;
    } else if (investor.investmentMax !== undefined) {
      return `Max: ${formatInvestment(investor.investmentMax)}`;
    }
    return null;
  };

  // Handle delete with confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Sei sicuro di voler eliminare "${investor.name}"?`)) {
      onDelete?.(investor.id);
    }
  };
  
  // Generate LinkedIn search URL based on investor name
  const getLinkedinSearchUrl = () => {
    if (!investor.name) return "";
    const encodedName = encodeURIComponent(investor.name);
    return `https://www.linkedin.com/search/results/all/?keywords=${encodedName}`;
  };

  // Generate Google search URL based on investor name
  const getGoogleSearchUrl = () => {
    if (!investor.name) return "";
    const encodedName = encodeURIComponent(investor.name);
    return `https://www.google.com/search?q=${encodedName}`;
  };

  // Get tag color based on investor type
  const getTypeTagColor = (type: string) => {
    if (!type) return "bg-primary/5 text-primary/80"; // Default color
    
    // Color map based on first letter
    const colorMap: Record<string, string> = {
      'a': "bg-red-100 text-red-700",
      'b': "bg-pink-100 text-pink-700",
      'c': "bg-purple-100 text-purple-700",
      'd': "bg-indigo-100 text-indigo-700",
      'e': "bg-blue-100 text-blue-700",
      'f': "bg-cyan-100 text-cyan-700",
      'g': "bg-teal-100 text-teal-700",
      'h': "bg-emerald-100 text-emerald-700",
      'i': "bg-green-100 text-green-700",
      'j': "bg-lime-100 text-lime-700",
      'k': "bg-yellow-100 text-yellow-700",
      'l': "bg-amber-100 text-amber-700",
      'm': "bg-orange-100 text-orange-700",
      'n': "bg-rose-100 text-rose-700",
      'o': "bg-violet-100 text-violet-700",
      'p': "bg-fuchsia-100 text-fuchsia-700",
      'q': "bg-sky-100 text-sky-700",
      'r': "bg-red-50 text-red-600",
      's': "bg-pink-50 text-pink-600",
      't': "bg-purple-50 text-purple-600",
      'u': "bg-indigo-50 text-indigo-600",
      'v': "bg-blue-50 text-blue-600",
      'w': "bg-cyan-50 text-cyan-600",
      'x': "bg-teal-50 text-teal-600",
      'y': "bg-emerald-50 text-emerald-600",
      'z': "bg-green-50 text-green-600"
    };
    
    // Get first letter of the type (lowercase) and find the corresponding color
    const firstLetter = type.charAt(0).toLowerCase();
    return colorMap[firstLetter] || "bg-gray-100 text-gray-700"; // Fallback to gray
  };

  // Extract just the color name (without bg- prefix) for the border
  const getBorderColor = (type: string) => {
    if (!type) return "border-primary"; // Default border color
    
    // Color map for borders based on first letter
    const borderColorMap: Record<string, string> = {
      'a': "border-red-700",
      'b': "border-pink-700",
      'c': "border-purple-700",
      'd': "border-indigo-700",
      'e': "border-blue-700",
      'f': "border-cyan-700",
      'g': "border-teal-700",
      'h': "border-emerald-700",
      'i': "border-green-700",
      'j': "border-lime-700",
      'k': "border-yellow-700",
      'l': "border-amber-700",
      'm': "border-orange-700",
      'n': "border-rose-700",
      'o': "border-violet-700",
      'p': "border-fuchsia-700",
      'q': "border-sky-700",
      'r': "border-red-600",
      's': "border-pink-600",
      't': "border-purple-600",
      'u': "border-indigo-600",
      'v': "border-blue-600",
      'w': "border-cyan-600",
      'x': "border-teal-600",
      'y': "border-emerald-600",
      'z': "border-green-600"
    };
    
    const firstLetter = type.charAt(0).toLowerCase();
    return borderColorMap[firstLetter] || "border-gray-700"; // Fallback to gray
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl p-4 mb-3 border-l-4 shadow-sm transition-all duration-300 cursor-grab group card",
        "hover:shadow-md hover:animate-card-hover active:cursor-grabbing select-none",
        "relative", // added for positioning delete button
        getBorderColor(investor.type || ""), // Dynamic border color based on investor type
        className
      )}
      onDoubleClick={() => onEdit(investor)}
      draggable="true"
      data-investor-id={investor.id}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-destructive"
        onClick={handleDelete}
        title="Elimina investitore"
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>

      <div className="space-y-2">
        <h3 className="font-medium text-foreground/90 text-sm">
          {investor.name}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {investor.type && (
            <div className={`inline-block px-2 py-0.5 rounded-full text-xs ${getTypeTagColor(investor.type)}`}>
              {investor.type}
            </div>
          )}
          
          {investmentText() && (
            <div className="inline-flex items-center px-2 py-0.5 bg-green-50 rounded-full text-xs text-green-700">
              <EuroIcon className="w-3 h-3 mr-1" />
              {investmentText()}
            </div>
          )}
        </div>
        
        {investor.description && (
          <p className="text-xs text-foreground/60 line-clamp-3 mt-1">
            {investor.description}
          </p>
        )}
        
        {/* Contact information section */}
        <div className="flex items-center gap-2 mt-2">
          {investor.email && (
            <a 
              href={`mailto:${investor.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-700 transition-colors inline-flex items-center text-xs"
              title={investor.email}
            >
              <Mail className="h-3 w-3 mr-1 text-blue-500" />
              <span className="sr-only">Email</span>
            </a>
          )}
          
          {/* Show LinkedIn profile link when available */}
          {investor.linkedin ? (
            <a 
              href={investor.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center text-xs"
              title="LinkedIn profilo"
            >
              <Linkedin className="h-3 w-3 mr-1" />
              Profilo
            </a>
          ) : (
            /* Show Google search link when LinkedIn is not available */
            <a 
              href={getGoogleSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-orange-500 hover:text-orange-700 transition-colors inline-flex items-center text-xs"
              title="Cerca su Google"
            >
              <Search className="h-3 w-3 mr-1" />
              Cerca
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
