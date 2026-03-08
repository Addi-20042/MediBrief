import { Skeleton } from "@/components/ui/skeleton";

const SymptomsSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-5 w-96" />
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
      </div>
      <Skeleton className="h-11 w-48 rounded-lg" />
    </div>
  </div>
);

export default SymptomsSkeleton;
