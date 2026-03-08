import { Skeleton } from "@/components/ui/skeleton";

const EmergencySkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-6">
    <Skeleton className="h-10 w-56" />
    <Skeleton className="h-5 w-72" />
    <Skeleton className="h-11 w-full max-w-md rounded-lg" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export default EmergencySkeleton;
