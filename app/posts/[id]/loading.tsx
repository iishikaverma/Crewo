import { Skeleton, CardSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-16 w-full rounded-[12px]" />
      <div className="flex flex-col gap-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
