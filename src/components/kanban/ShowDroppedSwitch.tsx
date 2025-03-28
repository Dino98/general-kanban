
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowDroppedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const ShowDroppedSwitch: React.FC<ShowDroppedSwitchProps> = ({ checked, onChange, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch
        id="show-dropped"
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-purple-500"
      />
      <label 
        htmlFor="show-dropped" 
        className="text-sm font-medium cursor-pointer flex items-center gap-1.5 text-white"
      >
        {checked ? (
          <>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Mostra opportunità perse</span>
          </>
        ) : (
          <>
            <EyeOff className="h-4 w-4" />
            <span className="hidden sm:inline">Mostra opportunità perse</span>
          </>
        )}
      </label>
    </div>
  );
};

export default ShowDroppedSwitch;
