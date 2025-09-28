import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Crown, CreditCard, Bell, Calendar, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useSimulation } from '../../contexts/SimulationContext';

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { subscription, isProUser, cancelSubscription } = useSimulation();

  const handleBack = () => {
    setLocation('/');
  };

  const handleUpgrade = () => {
    setLocation('/upgrade');
  };

  const planDetails = {
    free: { name: 'Free', description: 'Basic features only' },
    one_time: { name: 'Clean it once', description: 'One-time optimization for $10' },
    monthly: { name: 'Keep it optimized', description: 'Monthly optimization for $5/month' }
  };

  const currentPlan = subscription.plan ? planDetails[subscription.plan] : planDetails.free;
  const isPro = isProUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="mr-3"
            data-testid="button-settings-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Plan Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{currentPlan.name}</span>
                    {isPro && (
                      <Badge variant="default" className="bg-primary">
                        <Crown className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
                  {subscription.expiresAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {subscription.expiresAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
                {!isPro ? (
                  <Button onClick={handleUpgrade} data-testid="button-upgrade-settings">
                    Upgrade
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={cancelSubscription}
                    data-testid="button-cancel-subscription"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              {isPro && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    All optimization features enabled
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                View your past transactions and upgrades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPro ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium">
                        {subscription.plan === 'one_time' ? 'One-time Purchase' : 'Monthly Subscription'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()} • 
                        {subscription.plan === 'one_time' ? ' $10.00' : ' $5.00/month'}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    This is a simulated transaction history for demo purposes.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No billing history yet</p>
                  <p className="text-sm text-muted-foreground">Upgrade to Pro to see your transactions here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="savings-alerts">Savings Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new optimization opportunities are found
                  </p>
                </div>
                <Switch id="savings-alerts" defaultChecked data-testid="switch-savings-alerts" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="monthly-reports">Monthly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive monthly summaries of your storage optimization
                  </p>
                </div>
                <Switch id="monthly-reports" defaultChecked={isPro} data-testid="switch-monthly-reports" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="upgrade-offers">Upgrade Offers</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about special pricing and new features
                  </p>
                </div>
                <Switch id="upgrade-offers" defaultChecked={!isPro} data-testid="switch-upgrade-offers" />
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>File Inventory Optimizer • Simulation Mode</p>
                <p className="mt-1">All features are simulated for demonstration purposes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}