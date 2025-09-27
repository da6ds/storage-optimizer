import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Table } from 'lucide-react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatFileSize, formatCurrency } from '../../../../shared/simulation';

export default function DiagnosticsView() {
  const { files, duplicateClusters, storageBreakdown, mode } = useSimulation();
  const { t } = useI18n();

  const handleExport = (format: string) => {
    // In a real implementation, this would generate and download files
    console.log(`Exporting data in ${format} format`);
    alert(`Export ${format} - This is a simulation. No actual export is performed.`);
  };

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('diagnostics.title')}</h1>
        <p className="text-muted-foreground">{t('diagnostics.subtitle')}</p>
      </div>

      {/* Export buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Options</CardTitle>
          <CardDescription>Download raw data and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('JSON')}
              data-testid="button-export-json"
            >
              <FileText className="h-4 w-4 mr-1" />
              {t('diagnostics.export_json')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('CSV')}
              data-testid="button-export-csv"
            >
              <Table className="h-4 w-4 mr-1" />
              {t('diagnostics.export_csv')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('Markdown')}
              data-testid="button-export-markdown"
            >
              <FileText className="h-4 w-4 mr-1" />
              {t('diagnostics.export_markdown')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('PDF')}
              data-testid="button-export-pdf"
            >
              <Download className="h-4 w-4 mr-1" />
              {t('diagnostics.export_pdf')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis heuristics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('diagnostics.heuristics_title')}</CardTitle>
          <CardDescription>Algorithm settings and thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <Badge variant="outline" className="mr-2">Cold Files</Badge>
            Files not modified in 180+ days and ≥1GB
          </div>
          <div className="text-sm">
            <Badge variant="outline" className="mr-2">Duplicates</Badge>
            Hash-based content matching across providers
          </div>
          <div className="text-sm">
            <Badge variant="outline" className="mr-2">Cost Optimization</Badge>
            Keep files on cheapest provider when duplicated
          </div>
        </CardContent>
      </Card>

      {/* Raw data tables */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files">Files ({files.length.toLocaleString()})</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates ({duplicateClusters.length})</TabsTrigger>
          <TabsTrigger value="costs">Costs ({storageBreakdown.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('diagnostics.files_table_title')}</CardTitle>
              <CardDescription>Complete file inventory across all providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-2 sticky top-0 bg-background">
                  <div>Provider</div>
                  <div>Path</div>
                  <div className="text-right">Size</div>
                  <div className="text-right">Modified</div>
                </div>
                {files.slice(0, 100).map((file) => (
                  <div key={file.id} className="grid grid-cols-4 gap-2 text-xs">
                    <div>{t(`providers.${file.provider}`)}</div>
                    <div className="truncate" title={file.path}>{file.path}</div>
                    <div className="text-right">{formatFileSize(file.size_bytes)}</div>
                    <div className="text-right">{new Date(file.last_modified).toLocaleDateString()}</div>
                  </div>
                ))}
                {files.length > 100 && (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    ... and {(files.length - 100).toLocaleString()} more files
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('diagnostics.duplicates_table_title')}</CardTitle>
              <CardDescription>Duplicate file clusters with savings potential</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                  <div>Hash</div>
                  <div className="text-right">Copies</div>
                  <div className="text-right">Size</div>
                  <div className="text-right">Savings</div>
                </div>
                {duplicateClusters.map((cluster) => (
                  <div key={cluster.hash} className="grid grid-cols-4 gap-2 text-xs">
                    <div className="font-mono truncate">{cluster.hash}</div>
                    <div className="text-right">{cluster.files.length}</div>
                    <div className="text-right">{formatFileSize(cluster.total_size_bytes)}</div>
                    <div className="text-right">{formatCurrency(cluster.potential_savings_usd)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('diagnostics.costs_table_title')}</CardTitle>
              <CardDescription>Detailed cost breakdown by provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                  <div>Provider</div>
                  <div className="text-right">Files</div>
                  <div className="text-right">Storage</div>
                  <div className="text-right">Monthly Cost</div>
                </div>
                {storageBreakdown.map((provider) => (
                  <div key={provider.provider} className="grid grid-cols-4 gap-2 text-xs">
                    <div>{t(`providers.${provider.provider}`)}</div>
                    <div className="text-right">{provider.total_files.toLocaleString()}</div>
                    <div className="text-right">{formatFileSize(provider.total_size_gb * 1024 * 1024 * 1024)}</div>
                    <div className="text-right">{formatCurrency(provider.estimated_monthly_cost)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}