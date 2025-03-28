
import React from "react";
import { Investor, InvestorStatus } from "@/utils/excelParser";
import KanbanCard from "@/components/KanbanCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface KanbanColumnProps {
  title: string;
  status: InvestorStatus;
  investors: Investor[];
  onEditInvestor: (investor: Investor) => void;
  onDeleteInvestor?: (investorId: string) => void;
  onAddInvestor?: (status: InvestorStatus) => void;
  animationDelay: string;
  backgroundColor: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  investors,
  onEditInvestor,
  onDeleteInvestor,
  onAddInvestor,
  animationDelay,
  backgroundColor,
}) => {
  const isMobile = useIsMobile();
  const filteredInvestors = investors.filter(
    (investor) => investor.status === status
  );

  return (
    <div
      className={cn(
        "h-full flex-1 min-w-[280px] rounded-xl flex flex-col animate-slide-up overflow-hidden card-shadow",
        isMobile ? "w-full" : "w-[280px]",
        animationDelay
      )}
      style={{ backgroundColor }}
      data-status={status}
    >
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 text-xs rounded-full bg-white/50 backdrop-blur-sm">
            {filteredInvestors.length}
          </span>
          {onAddInvestor && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full bg-white/50 hover:bg-white/70"
              onClick={() => onAddInvestor(status)}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Aggiungi investitore</span>
            </Button>
          )}
        </div>
      </div>
      
      <div
        className="flex-1 p-3 min-h-[500px] max-h-[calc(100vh-180px)] overflow-y-auto kanban-scroll bg-white/20 backdrop-blur-[2px] rounded-lg mx-3 mb-3 border border-white/40"
        id={`droppable-${status.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {filteredInvestors.map((investor) => (
          <KanbanCard
            key={investor.id}
            investor={investor}
            onEdit={onEditInvestor}
            onDelete={onDeleteInvestor}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
