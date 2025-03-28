
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Cerca investitore..."
}) => {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-3.5 w-3.5 text-white/70" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-7 pr-7 py-1 h-8 w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 h-6 w-6 hover:bg-white/10 text-white/70"
            onClick={handleClearSearch}
            aria-label="Cancella ricerca"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
