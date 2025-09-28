import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Scan, Shield, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';

export default function DeviceConnectionPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { markDeviceLinked } = useSimulation();
  const [step, setStep] = useState<'intro' | 'scanning' | 'complete'>('intro');
  const [progress, setProgress] = useState(0);

  const handleStartScanning = () => {
    setStep('scanning');
    setProgress(0);
    
    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setStep('complete');
            markDeviceLinked(); // Mark device as linked after successful scan
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleComplete = () => {
    // Return to map view after completion
    setLocation('/map');
  };

  const handleCancel = () => {
    // Return to previous view
    setLocation('/map');
  };

  if (step === 'scanning') {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Scan className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <CardTitle>Scanning this device</CardTitle>
              <CardDescription>
                Analyzing your files and storage usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={progress} className="h-3" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 30 && "Scanning system folders..."}
                {progress >= 30 && progress < 60 && "Analyzing file sizes..."}
                {progress >= 60 && progress < 90 && "Calculating storage usage..."}
                {progress >= 90 && "Finalizing scan..."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Device connected successfully</CardTitle>
              <CardDescription>
                Your device is now linked to StorageMap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>✓ Found and analyzed local storage</p>
                <p>✓ Identified file types and sizes</p>
                <p>✓ Created secure connection</p>
              </div>
              <Button 
                onClick={handleComplete}
                className="w-full"
                data-testid="button-complete-device"
              >
                Continue to StorageMap
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-none border-b bg-card">
        <div className="flex items-center p-3 md:p-4 gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCancel}
            aria-label="Go back"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Connect this device</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Link this device</CardTitle>
            <CardDescription>
              Grant StorageMap permission to scan your local files and folders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Scan className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Scan local storage</p>
                  <p className="text-xs text-muted-foreground">
                    Analyze files, folders, and storage usage on this device
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Privacy protected</p>
                  <p className="text-xs text-muted-foreground">
                    Only file metadata is analyzed. Content remains private.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Permission required</p>
                  <p>StorageMap needs access to scan your device for storage optimization.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleStartScanning}
                className="w-full"
                data-testid="button-start-device-scan"
              >
                Grant access & scan device
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
                className="w-full"
                data-testid="button-cancel-device"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}