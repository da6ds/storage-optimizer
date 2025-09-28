import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Check, Smartphone, HardDrive } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* App Identity */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Cloud className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-app-name">
              StorageMap
            </h1>
          </div>
          <p className="text-lg text-muted-foreground" data-testid="text-tagline">
            See it all. Clean it all.
          </p>
        </div>

        {/* Hero Section */}
        <Card className="p-6">
          <CardContent className="space-y-6 p-0">
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <Smartphone className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-headline">
                Take control of your storage
              </h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-subcopy">
                Link your devices and cloud accounts to see all your files in one place. 
                Then, with one tap, let us clean it all up and cut your storage costs — automatically.
              </p>
            </div>

            {/* 3-Step Expectations */}
            <div className="space-y-3" data-testid="section-expectations">
              <div className="flex items-center space-x-3 text-left">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <span className="text-foreground font-medium">1. Link this device</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <span className="text-foreground font-medium">2. Link your accounts</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <span className="text-foreground font-medium">3. Optimize your storage</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4">
              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="w-full"
                data-testid="button-get-started"
              >
                Get started → Link this device
              </Button>
              <Button 
                onClick={onLogin}
                variant="ghost" 
                size="lg" 
                className="w-full"
                data-testid="button-login"
              >
                Log in
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <Cloud className="h-3 w-3" />
            <span>Private</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check className="h-3 w-3" />
            <span>Free to try</span>
          </div>
        </div>
      </div>
    </div>
  );
}