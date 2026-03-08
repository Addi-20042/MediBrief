import { Skeleton } from "@/components/ui/skeleton";

const LearnSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-6">
    <Skeleton className="h-10 w-56" />
    <Skeleton className="h-11 w-full max-w-md rounded-lg" />
    <div className="flex gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="border rounded-xl p-5 space-y-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  </div>
);

export default LearnSkeleton;
