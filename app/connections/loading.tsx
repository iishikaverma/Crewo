import { Skeleton, CardSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-7 w-40" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
