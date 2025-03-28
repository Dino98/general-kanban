
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center">
          <FileQuestion className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl font-bold">404</h1>
          <p className="text-xl text-muted-foreground mt-4">
            La pagina "{location.pathname}" non esiste
          </p>
        </div>

        <div className="flex flex-col space-y-3 mt-6">
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

export default NotFound;
