import { Skeleton } from "@/components/ui/skeleton";

const UploadReportSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-5 w-80" />
    <div className="border-2 border-dashed rounded-xl p-8 space-y-4 flex flex-col items-center">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="h-11 w-48 rounded-lg" />
  </div>
);

export default UploadReportSkeleton;
