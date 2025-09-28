import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cloud, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { SiGoogledrive, SiDropbox, SiIcloud } from 'react-icons/si';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';

type CloudProvider = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  connected: boolean;
};

export default function CloudConnectionPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { markCloudAccountsLinked } = useSimulation();
  const [step, setStep] = useState<'intro' | 'connecting' | 'complete'>('intro');
  const [progress, setProgress] = useState(0);
  const [connectingProvider, setConnectingProvider] = useState<string>('');

  const [providers, setProviders] = useState<CloudProvider[]>([
    {
      id: 'googledrive',
      name: 'Google Drive',
      icon: SiGoogledrive,
      color: 'text-blue-600',
      connected: false
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: SiDropbox,
      color: 'text-blue-500',
      connected: false
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: Cloud,
      color: 'text-blue-700',
      connected: false
    },
    {
      id: 'icloud',
      name: 'iCloud Drive',
      icon: SiIcloud,
      color: 'text-gray-600',
      connected: false
    }
  ]);

  const handleConnectProvider = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    setConnectingProvider(provider.name);
    setStep('connecting');
    setProgress(0);
    
    // Simulate connection progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            // Mark provider as connected
            setProviders(prev => prev.map(p => 
              p.id === providerId ? { ...p, connected: true } : p
            ));
            setStep('intro');
            setConnectingProvider('');
          }, 500);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const handleComplete = () => {
    const connectedCount = providers.filter(p => p.connected).length;
    if (connectedCount > 0) {
      markCloudAccountsLinked(); // Mark cloud accounts as linked
      setStep('complete');
    }
  };

  const handleFinish = () => {
    // Return to map view after completion
    setLocation('/map');
  };

  const handleCancel = () => {
    // Return to previous view
    setLocation('/map');
  };

  if (step === 'connecting') {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Cloud className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <CardTitle>Connecting to {connectingProvider}</CardTitle>
              <CardDescription>
                Analyzing your cloud storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={progress} className="h-3" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 30 && "Authenticating with provider..."}
                {progress >= 30 && progress < 60 && "Scanning files and folders..."}
                {progress >= 60 && progress < 90 && "Analyzing storage usage..."}
                {progress >= 90 && "Finalizing connection..."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    const connectedProviders = providers.filter(p => p.connected);
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Cloud accounts connected</CardTitle>
              <CardDescription>
                {connectedProviders.length} provider{connectedProviders.length !== 1 ? 's' : ''} successfully linked to StorageMap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                {connectedProviders.map(provider => (
                  <p key={provider.id}>✓ {provider.name} connected</p>
                ))}
                <p>✓ File analysis complete</p>
                <p>✓ Storage optimization ready</p>
              </div>
              <Button 
                onClick={handleFinish}
                className="w-full"
                data-testid="button-complete-cloud"
              >
                Continue to StorageMap
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const connectedCount = providers.filter(p => p.connected).length;

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
          <h1 className="text-lg font-semibold">Connect cloud accounts</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Link your cloud storage
            </CardTitle>
            <CardDescription>
              Connect your cloud accounts to see the complete picture of your storage usage and find optimization opportunities
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Provider list */}
        <div className="space-y-3">
          {providers.map((provider) => {
            const IconComponent = provider.icon;
            return (
              <Card key={provider.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 ${provider.color}`}>
                      <IconComponent size={32} />
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {provider.connected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.connected && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                    <Button
                      variant={provider.connected ? "outline" : "default"}
                      size="sm"
                      onClick={() => !provider.connected && handleConnectProvider(provider.id)}
                      disabled={provider.connected}
                      data-testid={`button-connect-${provider.id}`}
                    >
                      {provider.connected ? 'Connected' : 'Connect'}
                      {!provider.connected && <ExternalLink className="h-3 w-3 ml-1" />}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {connectedCount > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {connectedCount} account{connectedCount !== 1 ? 's' : ''} connected
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  You can continue with these connections or add more providers for a complete analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium">Secure connections</p>
              <p>StorageMap uses OAuth for secure, read-only access. We never store your login credentials.</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {connectedCount > 0 && (
            <Button 
              onClick={handleComplete}
              className="w-full"
              data-testid="button-continue-cloud"
            >
              Continue with {connectedCount} connected account{connectedCount !== 1 ? 's' : ''}
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={handleCancel}
            className="w-full"
            data-testid="button-cancel-cloud"
          >
            {connectedCount > 0 ? 'Skip for now' : 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );
}