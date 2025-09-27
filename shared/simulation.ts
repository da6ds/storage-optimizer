import YAML from 'yaml';

export interface SimulatedFile {
  id: string;
  provider: string;
  provider_id: string;
  path: string;
  size_bytes: number;
  last_modified: string;
  hash: string;
  mime: string;
  url?: string | null;
  access_tier?: string | null;
  location?: string;
}

export interface ProviderPricing {
  plan: string;
  base_usd_per_month: number;
  included_gb: number;
  overage_usd_per_gb: number;
  archive_usd_per_gb: number;
}

export interface PricingConfig {
  providers: Record<string, ProviderPricing>;
  notes: string;
}

export interface DuplicateCluster {
  hash: string;
  files: SimulatedFile[];
  total_size_bytes: number;
  provider_count: number;
  recommended_keeper: SimulatedFile;
  potential_savings_usd: number;
}

export interface OptimizationAction {
  id: string;
  type: 'dedupe' | 'cold_storage' | 'consolidation';
  title: string;
  description: string;
  estimated_savings_usd: number;
  friction: 'low' | 'medium' | 'high';
  affected_files: SimulatedFile[];
  provider_changes: string[];
}

export interface StorageBreakdown {
  provider: string;
  total_files: number;
  total_size_gb: number;
  estimated_monthly_cost: number;
  file_types: Record<string, { count: number; size_gb: number }>;
}

// Provider key normalization - maps file provider names to pricing config keys
function normalizeProviderKey(provider: string): string {
  const providerMap: Record<string, string> = {
    'drive': 'google_drive',
    'google_drive': 'google_drive',
    'dropbox': 'dropbox',
    'onedrive': 'onedrive',
    'icloud': 'icloud',
    'local': 'local'
  };
  return providerMap[provider.toLowerCase()] || provider;
}

// Cost calculation utilities
export class CostCalculator {
  constructor(private pricingConfig: PricingConfig) {}

  calculateProviderCost(provider: string, usageGb: number): number {
    const normalizedProvider = normalizeProviderKey(provider);
    const pricing = this.pricingConfig.providers[normalizedProvider];
    if (!pricing) return 0;

    if (usageGb <= pricing.included_gb) {
      return pricing.base_usd_per_month;
    }

    const overage = usageGb - pricing.included_gb;
    return pricing.base_usd_per_month + (overage * pricing.overage_usd_per_gb);
  }

  getCheapestProviderForSize(sizeGb: number): { provider: string; cost: number } {
    let cheapest = { provider: '', cost: Infinity };

    for (const [provider, pricing] of Object.entries(this.pricingConfig.providers)) {
      const cost = this.calculateProviderCost(provider, sizeGb);
      if (cost < cheapest.cost) {
        cheapest = { provider, cost };
      }
    }

    return cheapest;
  }

  calculateArchiveSavings(files: SimulatedFile[]): number {
    let totalSavings = 0;

    for (const file of files) {
      const sizeGb = file.size_bytes / (1024 * 1024 * 1024);
      const normalizedProvider = normalizeProviderKey(file.provider);
      const pricing = this.pricingConfig.providers[normalizedProvider];
      if (!pricing) continue;

      const currentCost = sizeGb * pricing.overage_usd_per_gb;
      const archiveCost = sizeGb * pricing.archive_usd_per_gb;
      totalSavings += Math.max(0, currentCost - archiveCost);
    }

    return totalSavings;
  }
}

// File analysis utilities
export class FileAnalyzer {
  constructor(private costCalculator: CostCalculator) {}

  categorizeByType(files: SimulatedFile[]): Record<string, SimulatedFile[]> {
    const categories: Record<string, SimulatedFile[]> = {
      image: [],
      video: [],
      audio: [],
      document: [],
      archive: [],
      other: []
    };

    for (const file of files) {
      const type = this.getFileCategory(file.mime);
      categories[type].push(file);
    }

    return categories;
  }

  private getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('archive')) return 'archive';
    return 'other';
  }

  findDuplicateClusters(files: SimulatedFile[]): DuplicateCluster[] {
    const hashGroups = new Map<string, SimulatedFile[]>();

    // Group files by hash
    for (const file of files) {
      if (!hashGroups.has(file.hash)) {
        hashGroups.set(file.hash, []);
      }
      hashGroups.get(file.hash)!.push(file);
    }

    // Filter to only duplicates (clusters with > 1 file)
    const clusters: DuplicateCluster[] = [];
    
    for (const [hash, clusterFiles] of Array.from(hashGroups.entries())) {
      if (clusterFiles.length > 1) {
        const totalSize = clusterFiles[0].size_bytes;
        const providers = new Set(clusterFiles.map((f: SimulatedFile) => f.provider));
        
        // Find cheapest provider for this file size
        const sizeGb = totalSize / (1024 * 1024 * 1024);
        const cheapest = this.costCalculator.getCheapestProviderForSize(sizeGb);
        
        // Find the keeper (preferably on cheapest provider, or newest file)
        let keeper = clusterFiles[0];
        for (const file of clusterFiles) {
          if (normalizeProviderKey(file.provider) === cheapest.provider) {
            keeper = file;
            break;
          }
          if (new Date(file.last_modified) > new Date(keeper.last_modified)) {
            keeper = file;
          }
        }

        // Calculate potential savings from removing duplicates
        const duplicatesToRemove = clusterFiles.filter((f: SimulatedFile) => f.id !== keeper.id);
        let savings = 0;
        for (const duplicate of duplicatesToRemove) {
          const duplicateSizeGb = duplicate.size_bytes / (1024 * 1024 * 1024);
          savings += this.costCalculator.calculateProviderCost(duplicate.provider, duplicateSizeGb);
        }

        clusters.push({
          hash,
          files: clusterFiles,
          total_size_bytes: totalSize,
          provider_count: providers.size,
          recommended_keeper: keeper,
          potential_savings_usd: savings
        });
      }
    }

    return clusters.sort((a, b) => b.potential_savings_usd - a.potential_savings_usd);
  }

  findColdFiles(files: SimulatedFile[], daysThreshold = 180, sizeThresholdGb = 1): SimulatedFile[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    return files.filter(file => {
      const fileDate = new Date(file.last_modified);
      const sizeGb = file.size_bytes / (1024 * 1024 * 1024);
      return fileDate < cutoffDate && sizeGb >= sizeThresholdGb;
    });
  }

  generateStorageBreakdown(files: SimulatedFile[]): StorageBreakdown[] {
    const providerGroups = new Map<string, SimulatedFile[]>();

    // Group by provider
    for (const file of files) {
      if (!providerGroups.has(file.provider)) {
        providerGroups.set(file.provider, []);
      }
      providerGroups.get(file.provider)!.push(file);
    }

    const breakdown: StorageBreakdown[] = [];

    for (const [provider, providerFiles] of Array.from(providerGroups.entries())) {
      const totalSizeBytes = providerFiles.reduce((sum: number, f: SimulatedFile) => sum + f.size_bytes, 0);
      const totalSizeGb = totalSizeBytes / (1024 * 1024 * 1024);
      
      const fileTypes = this.categorizeByType(providerFiles);
      const fileTypeStats: Record<string, { count: number; size_gb: number }> = {};
      
      for (const [type, typeFiles] of Object.entries(fileTypes)) {
        const typeSizeBytes = typeFiles.reduce((sum, f) => sum + f.size_bytes, 0);
        fileTypeStats[type] = {
          count: typeFiles.length,
          size_gb: typeSizeBytes / (1024 * 1024 * 1024)
        };
      }

      breakdown.push({
        provider,
        total_files: providerFiles.length,
        total_size_gb: totalSizeGb,
        estimated_monthly_cost: this.costCalculator.calculateProviderCost(provider, totalSizeGb),
        file_types: fileTypeStats
      });
    }

    return breakdown.sort((a, b) => b.estimated_monthly_cost - a.estimated_monthly_cost);
  }

  generateOptimizationActions(files: SimulatedFile[]): OptimizationAction[] {
    const actions: OptimizationAction[] = [];

    // Deduplication actions
    const duplicateClusters = this.findDuplicateClusters(files);
    for (const cluster of duplicateClusters.slice(0, 10)) { // Top 10 clusters
      const duplicatesToRemove = cluster.files.filter(f => f.id !== cluster.recommended_keeper.id);
      
      actions.push({
        id: `dedupe-${cluster.hash}`,
        type: 'dedupe',
        title: `Remove ${duplicatesToRemove.length} duplicate copies`,
        description: `Keep file on ${cluster.recommended_keeper.provider}, remove copies from other providers`,
        estimated_savings_usd: cluster.potential_savings_usd,
        friction: duplicatesToRemove.length <= 3 ? 'low' : duplicatesToRemove.length <= 8 ? 'medium' : 'high',
        affected_files: duplicatesToRemove,
        provider_changes: Array.from(new Set(duplicatesToRemove.map((f: SimulatedFile) => f.provider)))
      });
    }

    // Cold storage actions
    const coldFiles = this.findColdFiles(files);
    if (coldFiles.length > 0) {
      const savings = this.costCalculator.calculateArchiveSavings(coldFiles);
      
      actions.push({
        id: 'cold-storage',
        type: 'cold_storage',
        title: `Archive ${coldFiles.length} old files`,
        description: `Move large files older than 6 months to cheaper archive storage`,
        estimated_savings_usd: savings,
        friction: coldFiles.length <= 20 ? 'low' : coldFiles.length <= 100 ? 'medium' : 'high',
        affected_files: coldFiles,
        provider_changes: Array.from(new Set(coldFiles.map((f: SimulatedFile) => f.provider)))
      });
    }

    return actions.sort((a, b) => b.estimated_savings_usd - a.estimated_savings_usd);
  }
}

// Utility functions
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}