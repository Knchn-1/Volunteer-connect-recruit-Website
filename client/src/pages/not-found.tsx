import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-neutral-800">404 Page Not Found</h1>
          </div>

          <p className="mt-4 mb-6 text-neutral-600">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          <Button 
            onClick={() => setLocation("/")}
            className="w-full"
          >
            Return to Home Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
