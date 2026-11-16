export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-2 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="flex gap-3 rounded-[12px] border border-border bg-surface p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/3 rounded-full" />
      </div>
    </div>
  );
}
