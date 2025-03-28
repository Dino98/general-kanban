
import React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { KanbanSquare, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ShowDroppedSwitch from "./kanban/ShowDroppedSwitch";
import SearchBar from "./SearchBar";

interface MenuBarProps {
  activeView: "board" | "analytics" | "settings";
  setActiveView: (view: "board" | "analytics" | "settings") => void;
  showDropped?: boolean;
  onToggleShowDropped?: (checked: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hasData?: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({ 
  activeView, 
  setActiveView, 
  showDropped, 
  onToggleShowDropped,
  searchQuery = "",
  onSearchChange,
  hasData = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center w-full justify-between bg-gradient-to-r from-purple-600/80 to-purple-800/80 rounded-xl backdrop-blur-md p-1 shadow-lg">
      <div className="flex items-center">
        <Menubar className="border-none bg-transparent px-2 h-auto">
          <MenubarMenu>
            <MenubarTrigger 
              onClick={() => setActiveView("board")}
              className={cn(
                "gap-2 text-sm font-medium transition-colors duration-200", 
                activeView === "board" 
                  ? "bg-white/20 text-white" 
                  : "bg-transparent hover:bg-white/10 text-white/80 hover:text-white"
              )}
            >
              <KanbanSquare className="h-4 w-4" />
              Board
            </MenubarTrigger>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger 
              onClick={() => setActiveView("analytics")}
              className={cn(
                "gap-2 text-sm font-medium transition-colors duration-200", 
                activeView === "analytics" 
                  ? "bg-white/20 text-white" 
                  : "bg-transparent hover:bg-white/10 text-white/80 hover:text-white"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </MenubarTrigger>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger 
              onClick={() => setActiveView("settings")}
              className={cn(
                "gap-2 text-sm font-medium transition-colors duration-200", 
                activeView === "settings" 
                  ? "bg-white/20 text-white" 
                  : "bg-transparent hover:bg-white/10 text-white/80 hover:text-white"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="flex items-center space-x-2">
        {/* Search bar - Only show in board view when we have data */}
        {activeView === "board" && hasData && onSearchChange && (
          <div className="max-w-xs w-40 md:w-60 lg:w-72">
            <SearchBar
              searchQuery={searchQuery || ""}
              onSearchChange={onSearchChange}
              placeholder="Cerca investitore..."
            />
          </div>
        )}

        {/* Show dropped switch */}
        {activeView === "board" && showDropped !== undefined && onToggleShowDropped && (
          <div>
            <ShowDroppedSwitch 
              checked={showDropped} 
              onChange={onToggleShowDropped} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBar;
