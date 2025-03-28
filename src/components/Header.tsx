
import React from "react";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import ShowDroppedSwitch from "@/components/kanban/ShowDroppedSwitch";
import { AlertTriangle } from "lucide-react"; 
import ExportButton from "./ExportButton";
import MenuBar from "./MenuBar";
import SearchBar from "./SearchBar";

interface HeaderProps {
  activeView: "board" | "analytics" | "settings";
  setActiveView: (view: "board" | "analytics" | "settings") => void;
  showDropped: boolean;
  onToggleShowDropped: (showDropped: boolean) => void;
  onExportJson?: () => void;
  hasData?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  showDropped,
  onToggleShowDropped,
  onExportJson,
  hasData = false,
  searchQuery = "",
  onSearchChange
}) => {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex h-14 items-center px-4">
        <MenuBar 
          activeView={activeView} 
          setActiveView={setActiveView}
          showDropped={showDropped}
          onToggleShowDropped={onToggleShowDropped}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          hasData={hasData}
        />
      </div>
    </header>
  );
};

export default Header;
