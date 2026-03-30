import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The calculator you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
