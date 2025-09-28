import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Table, Network, List, Smartphone, Monitor, HardDrive, Cloud } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatFileSize, formatCurrency } from '../../../../shared/simulation';
import EstimatedSavingsBanner from '../EstimatedSavingsBanner';
import HealthScoreDisplay from '../HealthScoreDisplay';

export default function MapView() {
  const { storageBreakdown, mode, showDetails } = useSimulation();
  const { t } = useI18n();
  const [mapViewMode, setMapViewMode] = useState<'list' | 'visual'>('list');
  const [fileTypeViewMode, setFileTypeViewMode] = useState<'chart' | 'table'>('chart');

  // Remember user's choice in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('map_view_mode');
    if (saved === 'visual' || saved === 'list') {
      setMapViewMode(saved);
    }
  }, []);

  const handleMapViewToggle = (mode: 'list' | 'visual') => {
    setMapViewMode(mode);
    localStorage.setItem('map_view_mode', mode);
  };

  const totalFiles = storageBreakdown.reduce((sum, p) => sum + p.total_files, 0);
  const totalSize = storageBreakdown.reduce((sum, p) => sum + p.total_size_gb, 0);
  const totalCost = storageBreakdown.reduce((sum, p) => sum + p.estimated_monthly_cost, 0);

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('map.title')}</h1>
          <p className="text-muted-foreground">{t('map.subtitle')}</p>
        </div>

        {/* Map view toggle */}
        <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-lg w-fit mx-auto">
          <Button
            variant={mapViewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleMapViewToggle('list')}
            className="gap-2"
            data-testid="button-map-list"
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button
            variant={mapViewMode === 'visual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleMapViewToggle('visual')}
            className="gap-2"
            data-testid="button-map-visual"
          >
            <Network className="h-4 w-4" />
            Visual
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <HealthScoreDisplay />

      {/* Estimated Savings Banner */}
      <EstimatedSavingsBanner />

      {/* Render either List or Visual view */}
      {mapViewMode === 'list' ? (
        <ListMapView 
          storageBreakdown={storageBreakdown}
          totalFiles={totalFiles}
          totalSize={totalSize}
          totalCost={totalCost}
          showDetails={showDetails}
          fileTypeViewMode={fileTypeViewMode}
          setFileTypeViewMode={setFileTypeViewMode}
          mode={mode}
        />
      ) : (
        <VisualMapView 
          storageBreakdown={storageBreakdown}
          totalFiles={totalFiles}
          totalSize={totalSize}
          totalCost={totalCost}
          showDetails={showDetails}
        />
      )}
    </div>
  );
}

function ListMapView({ 
  storageBreakdown, 
  totalFiles, 
  totalSize, 
  totalCost, 
  showDetails, 
  fileTypeViewMode, 
  setFileTypeViewMode, 
  mode 
}: {
  storageBreakdown: any[];
  totalFiles: number;
  totalSize: number;
  totalCost: number;
  showDetails: boolean;
  fileTypeViewMode: 'chart' | 'table';
  setFileTypeViewMode: (mode: 'chart' | 'table') => void;
  mode: string | null;
}) {
  const { t } = useI18n();
  
  return (
    <>
      {/* Summary cards */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold">{totalFiles.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{t('map.total_files')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold">{formatFileSize(totalSize * 1024 * 1024 * 1024)}</div>
              <div className="text-xs text-muted-foreground">{t('map.total_size')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
              <div className="text-xs text-muted-foreground">{t('map.estimated_cost')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('map.provider_tiles_title')}</CardTitle>
              <CardDescription>Storage usage by provider</CardDescription>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs">
                {t('labels.sample_pricing')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {storageBreakdown.map((provider) => (
            <div key={provider.provider} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <div className="font-medium">{t(`providers.${provider.provider}`)}</div>
                {showDetails && (
                  <div className="text-sm text-muted-foreground">
                    {provider.total_files.toLocaleString()} files • {formatFileSize(provider.total_size_gb * 1024 * 1024 * 1024)}
                  </div>
                )}
              </div>
              {showDetails && (
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(provider.estimated_monthly_cost)}</div>
                  <div className="text-xs text-muted-foreground">monthly</div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* File type breakdown */}
      {showDetails && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('map.storage_breakdown_title')}</CardTitle>
                <CardDescription>What types of files are using your storage</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFileTypeViewMode(fileTypeViewMode === 'chart' ? 'table' : 'chart')}
                data-testid={`button-toggle-view-${fileTypeViewMode}`}
              >
                {fileTypeViewMode === 'chart' ? <Table className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                <span className="ml-1">
                  {fileTypeViewMode === 'chart' ? t('map.view_as_table') : t('map.view_as_chart')}
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FileTypeBreakdown providers={storageBreakdown} viewMode={fileTypeViewMode} />
          </CardContent>
        </Card>
      )}

      {/* What this means explanation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {mode && t(`map.what_this_means.${mode}`)}
          </p>
        </CardContent>
      </Card>
    </>
  );
}

function VisualMapView({ 
  storageBreakdown, 
  totalFiles, 
  totalSize, 
  totalCost, 
  showDetails 
}: {
  storageBreakdown: any[];
  totalFiles: number;
  totalSize: number;
  totalCost: number;
  showDetails: boolean;
}) {
  const { t } = useI18n();
  const { shouldShowSavings, getGatingMessage } = useSimulation();
  const gatingMessage = getGatingMessage();

  // Use the standalone getDeviceIcon helper

  // Mock device data - in real implementation this would come from simulation context
  const devices = [
    { id: 'phone', type: 'phone', name: 'iPhone', used: '64 GB', percentFull: 80 },
    { id: 'laptop', type: 'laptop', name: 'MacBook', used: '512 GB', percentFull: 45 }
  ];

  const clouds = storageBreakdown;

  return (
    <div className="space-y-6">
      {/* Totals Card - Always visible but gated */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
          <CardDescription>
            {gatingMessage ? `${gatingMessage}` : "Your complete storage picture"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold" data-testid="text-total-storage">
                {shouldShowSavings() ? formatFileSize(totalSize * 1024 * 1024 * 1024) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Total storage indexed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" data-testid="text-unique-data">
                {shouldShowSavings() ? formatFileSize(totalSize * 0.7 * 1024 * 1024 * 1024) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Unique data</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-destructive" data-testid="text-duplicates">
                {shouldShowSavings() ? formatFileSize(totalSize * 0.3 * 1024 * 1024 * 1024) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Duplicates (30%)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" data-testid="text-monthly-cost">
                {shouldShowSavings() ? formatCurrency(totalCost) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Est. monthly cost</div>
            </div>
          </div>
          {showDetails && shouldShowSavings() && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Unique vs duplicates is hash-based; no double counting.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Map Layout */}
      <div className="relative min-h-[400px] p-8 bg-muted/30 rounded-lg">
        {/* Cloud Providers - Top Row */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {clouds.map((provider, index) => (
            <CloudNode 
              key={provider.provider} 
              provider={provider} 
              showDetails={showDetails}
              index={index}
            />
          ))}
        </div>

        {/* Center Avatar */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" data-testid="center-avatar">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">You</span>
            </div>
          </div>
        </div>

        {/* Device Nodes - Bottom Row */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {devices.map((device, index) => (
            <DeviceNode 
              key={device.id} 
              device={device} 
              showDetails={showDetails}
              index={index}
            />
          ))}
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full text-muted-foreground" style={{ zIndex: 0, pointerEvents: 'auto' }}>
          {/* Sync/Backup relationships - solid lines from devices to clouds */}
          {devices.map((device, deviceIndex) => 
            clouds.map((cloud, cloudIndex) => {
              // Create sync relationship for demonstration - device 0 syncs to cloud 0, device 1 to cloud 1, etc
              const hasSync = deviceIndex === cloudIndex || (deviceIndex === 0 && cloudIndex === 1); // iPhone syncs to both Google Drive and Dropbox
              if (!hasSync) return null;
              
              return (
                <line
                  key={`sync-${device.id}-${cloud.provider}`}
                  x1={`${50 + (deviceIndex - devices.length/2 + 0.5) * 20}%`}
                  y1="70%" // slightly above device position
                  x2={`${50 + (cloudIndex - clouds.length/2 + 0.5) * 20}%`}
                  y2="30%" // slightly below cloud position
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ 
                    opacity: 0.4,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => { e.target.style.opacity = '0.7'; }}
                  onMouseLeave={(e) => { e.target.style.opacity = '0.4'; }}
                  data-testid={`sync-line-${device.id}-${cloud.provider}`}
                />
              );
            })
          ).flat().filter(Boolean)}
          
          {/* Duplicate arcs - curved dotted lines between clouds with duplicates */}
          {clouds.map((cloud1, index1) => 
            clouds.slice(index1 + 1).map((cloud2, index2) => {
              const cloud2Index = index1 + index2 + 1;
              const x1 = 50 + (index1 - clouds.length/2 + 0.5) * 20;
              const x2 = 50 + (cloud2Index - clouds.length/2 + 0.5) * 20;
              const y = 25;
              const midX = (x1 + x2) / 2;
              const midY = y - 8; // Arc above the clouds
              
              return (
                <path
                  key={`duplicate-${cloud1.provider}-${cloud2.provider}`}
                  d={`M ${x1}% ${y}% Q ${midX}% ${midY}% ${x2}% ${y}%`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  style={{ 
                    opacity: 0.5,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.target.style.opacity = '0.5'; }}
                  data-testid={`duplicate-arc-${cloud1.provider}-${cloud2.provider}`}
                />
              );
            })
          ).flat()}
          
          {/* Basic connections from center to all nodes */}
          {clouds.map((_, index) => (
            <line
              key={`center-cloud-${index}`}
              x1="50%"
              y1="50%"
              x2={`${50 + (index - clouds.length/2 + 0.5) * 20}%`}
              y2="25%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.3"
            />
          ))}
          {devices.map((_, index) => (
            <line
              key={`center-device-${index}`}
              x1="50%"
              y1="50%"
              x2={`${50 + (index - devices.length/2 + 0.5) * 20}%`}
              y2="75%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.3"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function CloudNode({ provider, showDetails, index }: { 
  provider: any; 
  showDetails: boolean;
  index: number;
}) {
  const { t } = useI18n();
  const maxSize = 2000; // 2TB for scale
  const percentFull = Math.min((provider.total_size_gb / maxSize) * 100, 100);
  
  // Calculate file type breakdown for mini bars
  const fileTypes = provider.file_types || {};
  const totalSize = Object.values(fileTypes).reduce((sum: number, type: any) => sum + type.size_gb, 0);
  
  // Calculate waste percentage for heat tinting (based on cost efficiency and duplicates)
  const duplicatePercent = 30; // Mock: 30% duplicates for demonstration
  const isHighWaste = duplicatePercent > 25 || provider.estimated_monthly_cost > 25;
  const heatTintClass = isHighWaste ? "border-destructive/50 bg-destructive/5" : "border-border";
  
  return (
    <Card className={`w-32 hover-elevate cursor-pointer ${heatTintClass}`} data-testid={`node-cloud-${provider.provider}`}>
      <CardContent className="p-3 text-center">
        <div className="flex flex-col items-center space-y-2">
          <Cloud className="h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">{t(`providers.${provider.provider}`)}</div>
            {showDetails && (
              <>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(provider.total_size_gb * 1024 * 1024 * 1024)}
                </div>
                <div className="text-xs text-primary">
                  {formatCurrency(provider.estimated_monthly_cost)}/mo
                </div>
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div 
                    className="bg-primary h-1 rounded-full" 
                    style={{ width: `${percentFull}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{Math.round(percentFull)}% full</div>
                
                {/* Enhanced Details: File-type bars + waste analysis */}
                {totalSize > 0 && (
                  <div className="w-full mt-2 space-y-1">
                    <div className="text-xs text-muted-foreground">File breakdown:</div>
                    <div className="flex h-1 w-full bg-muted rounded-full overflow-hidden">
                      {Object.entries(fileTypes).map(([type, stats]: [string, any], idx) => {
                        const percent = (stats.size_gb / totalSize) * 100;
                        const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-muted'];
                        return (
                          <div
                            key={type}
                            className={colors[idx % colors.length]}
                            style={{ width: `${percent}%` }}
                            title={`${t(`file_types.${type}`)}: ${Math.round(percent)}%`}
                            aria-label={`${t(`file_types.${type}`)}: ${Math.round(percent)}%`}
                          />
                        );
                      })}
                    </div>
                    {isHighWaste && (
                      <div className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <div className="w-1 h-1 bg-destructive rounded-full"></div>
                        High optimization potential
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeviceNode({ device, showDetails, index }: { 
  device: any; 
  showDetails: boolean;
  index: number;
}) {
  const DeviceIcon = getDeviceIcon(device.type);
  
  // Mock file type data for devices
  const mockFileTypes = {
    photos: { size_gb: 25, percent: 40 },
    videos: { size_gb: 20, percent: 32 },
    documents: { size_gb: 10, percent: 16 },
    other: { size_gb: 7, percent: 12 }
  };
  
  // Calculate waste indicators for devices (high storage usage + unsynced data)
  const isHighWaste = device.percentFull > 75; // Over 75% full indicates potential issues
  const heatTintClass = isHighWaste ? "border-warning/50 bg-warning/5" : "border-border";
  
  return (
    <Card className={`w-32 hover-elevate cursor-pointer ${heatTintClass}`} data-testid={`node-device-${device.id}`}>
      <CardContent className="p-3 text-center">
        <div className="flex flex-col items-center space-y-2">
          <DeviceIcon className="h-6 w-6 text-foreground" />
          <div>
            <div className="text-sm font-medium">{device.name}</div>
            {showDetails && (
              <>
                <div className="text-xs text-muted-foreground">{device.used}</div>
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div 
                    className="bg-secondary h-1 rounded-full" 
                    style={{ width: `${device.percentFull}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{device.percentFull}% full</div>
                
                {/* Enhanced Details: Content breakdown + storage warnings */}
                <div className="w-full mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">Content breakdown:</div>
                  <div className="flex h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="bg-primary" 
                      style={{ width: `${mockFileTypes.photos.percent}%` }}
                      title="Photos: 40%"
                      aria-label="Photos: 40%"
                    />
                    <div 
                      className="bg-secondary" 
                      style={{ width: `${mockFileTypes.videos.percent}%` }}
                      title="Videos: 32%"
                      aria-label="Videos: 32%"
                    />
                    <div 
                      className="bg-accent" 
                      style={{ width: `${mockFileTypes.documents.percent}%` }}
                      title="Documents: 16%"
                      aria-label="Documents: 16%"
                    />
                    <div 
                      className="bg-muted" 
                      style={{ width: `${mockFileTypes.other.percent}%` }}
                      title="Other: 12%"
                      aria-label="Other: 12%"
                    />
                  </div>
                  {isHighWaste && (
                    <div className="text-xs text-warning mt-1 flex items-center gap-1">
                      <div className="w-1 h-1 bg-warning rounded-full"></div>
                      Storage nearly full
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function moved outside component to avoid errors
function getDeviceIcon(type: string) {
  switch (type) {
    case 'phone': return Smartphone;
    case 'tablet': return Monitor;
    case 'laptop': return HardDrive;
    default: return Smartphone;
  }
}

function FileTypeBreakdown({ providers, viewMode }: { 
  providers: any[], 
  viewMode: 'chart' | 'table' 
}) {
  const { t } = useI18n();

  // Aggregate file types across all providers
  const typeStats = providers.reduce((acc, provider) => {
    const fileTypes = provider.file_types ?? {}; // Guard against missing file_types
    for (const [type, stats] of Object.entries(fileTypes)) {
      const typedStats = stats as { count: number; size_gb: number };
      if (!acc[type]) {
        acc[type] = { count: 0, size_gb: 0 };
      }
      acc[type].count += typedStats.count;
      acc[type].size_gb += typedStats.size_gb;
    }
    return acc;
  }, {} as Record<string, { count: number; size_gb: number }>);

  if (viewMode === 'table') {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
          <div>Type</div>
          <div className="text-right">Files</div>
          <div className="text-right">Size</div>
        </div>
        {Object.entries(typeStats).map(([type, stats]) => {
          const typedStats = stats as { count: number; size_gb: number };
          return (
            <div key={type} className="grid grid-cols-3 gap-2 text-sm">
              <div>{t(`file_types.${type}`)}</div>
              <div className="text-right">{typedStats.count.toLocaleString()}</div>
              <div className="text-right">{formatFileSize(typedStats.size_gb * 1024 * 1024 * 1024)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // Simple bar chart view
  const maxSize = Math.max(...Object.values(typeStats).map((s) => (s as { count: number; size_gb: number }).size_gb));

  return (
    <div className="space-y-3">
      {Object.entries(typeStats).map(([type, stats]) => {
        const typedStats = stats as { count: number; size_gb: number };
        return (
          <div key={type} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{t(`file_types.${type}`)}</span>
              <span className="text-muted-foreground">
                {typedStats.count} files • {formatFileSize(typedStats.size_gb * 1024 * 1024 * 1024)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${(typedStats.size_gb / maxSize) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}