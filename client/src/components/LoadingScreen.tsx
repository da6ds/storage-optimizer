export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-lg font-semibold">Loading StorageMap...</h2>
        <p className="text-sm text-muted-foreground">Mapping your storage across providers</p>
      </div>
    </div>
  );
}