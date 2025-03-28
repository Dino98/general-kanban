
import React, { useEffect } from "react";
import { Investor, InvestorStatus } from "@/utils/excelParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, TrendingUp, Users } from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnalyticsProps {
  investors: Investor[];
}

const Analytics: React.FC<AnalyticsProps> = ({ investors }) => {
  const isMobile = useIsMobile();
  const statuses: InvestorStatus[] = [
    "Da contattare",
    "Contattati",
    "Interessati",
    "Negoziazione",
    "A bordo!",
    "Drop definitivo",
  ];

  // Calculate counts for each status - ensure these are numbers
  const countByStatus = statuses.map(
    (status) => 
      investors.filter((investor) => investor.status === status).length
  );

  // Log data for debugging
  console.log("Investor status counts:", countByStatus);

  // Data for the status overview pie chart
  const statusOverviewData = [
    {
      name: "A bordo!",
      value: countByStatus[4],
      fill: "#60A5FA"
    },
    {
      name: "Drop definitivo",
      value: countByStatus[5],
      fill: "#EF4444"
    },
    {
      name: "In pipeline",
      value: countByStatus[0] + countByStatus[1] + countByStatus[2] + countByStatus[3],
      fill: "#10B981"
    }
  ];

  // Data for the distribution bar chart
  const distributionData = statuses.map((status, index) => ({
    name: status,
    value: countByStatus[index],
    fill: index === 5 ? "#EF4444" : "#9333EA"
  }));

  // Calculate capital raised from "A bordo!" investors for display
  const onboardInvestors = investors.filter(investor => investor.status === "A bordo!");
  const totalMinInvestment = onboardInvestors.reduce((sum, investor) => 
    sum + (investor.investmentMin || 0), 0);
  const totalMaxInvestment = onboardInvestors.reduce((sum, investor) => 
    sum + (investor.investmentMax || 0), 0);

  // Format numbers with € symbol and thousands separator
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Only render charts if we have valid data
  const hasValidDistributionData = distributionData.some(item => item.value > 0);
  const hasValidPieData = statusOverviewData.some(item => item.value > 0);

  // Force rerendering of charts when data changes - place the useEffect hook in the same position every render
  useEffect(() => {
    console.log("Analytics data updated, rerendering charts");
  }, [distributionData, statusOverviewData]);

  if (!investors.length) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-foreground/60">
          Importa prima il file Excel per visualizzare le statistiche
        </p>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto py-4 md:py-8 animate-fade-in">
      <h1 className="text-xl md:text-2xl font-medium mb-4 md:mb-8 text-center">
        Dashboard Analitica
      </h1>
      
      {/* Capital Raised Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
        <Card className="card-shadow bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-purple-700 text-lg md:text-xl">
              <CircleDollarSign className="h-5 w-5" />
              Capitale Raccolto (MIN)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl md:text-3xl font-bold text-purple-800">
              {formatCurrency(totalMinInvestment)}
            </div>
            <p className="text-xs md:text-sm text-purple-600 mt-1">
              Da {onboardInvestors.length} investitori a bordo
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-shadow bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-lg md:text-xl">
              <CircleDollarSign className="h-5 w-5" />
              Capitale Raccolto (MAX)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl md:text-3xl font-bold text-blue-800">
              {formatCurrency(totalMaxInvestment)}
            </div>
            <p className="text-xs md:text-sm text-blue-600 mt-1">
              Potenziale massimo di raccolta
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8">
        <Card className="card-shadow">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Users className="h-5 w-5" />
              Distribuzione Investitori
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-[300px] md:h-[400px]">
              {hasValidDistributionData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distributionData}
                    layout="vertical"
                    margin={isMobile ? 
                      { top: 10, right: 10, left: 80, bottom: 5 } : 
                      { top: 20, right: 30, left: 120, bottom: 5 }
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={isMobile ? 80 : 120}
                      tick={{ fontSize: isMobile ? 11 : 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value} investitori`, "Numero"]}
                    />
                    <Bar dataKey="value">
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Non ci sono dati per visualizzare il grafico</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <TrendingUp className="h-5 w-5" />
              Stato Generale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-[300px] md:h-[400px]">
              {hasValidPieData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusOverviewData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 90 : 120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => 
                        percent > 0 ? 
                          `${name}: ${(percent * 100).toFixed(1)}%` : 
                          ""
                      }
                    >
                      {statusOverviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} investitori`, "Numero"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Non ci sono dati per visualizzare il grafico</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
