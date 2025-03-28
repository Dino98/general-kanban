
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  title?: string;
  message?: string;
  code?: string | number;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  title = "Errore",
  message = "Si è verificato un errore durante il caricamento dell'applicazione.",
  code
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-bold">{title}</h1>
          {code && <div className="text-xl text-muted-foreground mt-1">Error {code}</div>}
        </div>

        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-3 mt-6">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Riprova
          </Button>
          
          <Button 
            onClick={() => navigate("/")}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Torna alla home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
