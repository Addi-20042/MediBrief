import { Skeleton } from "@/components/ui/skeleton";

const ChatbotSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
    <Skeleton className="h-10 w-48" />
    <div className="border rounded-xl p-4 space-y-4 h-[60vh]">
      <div className="flex gap-3 items-start">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <Skeleton className="h-16 w-3/4 rounded-lg" />
      </div>
      <div className="flex gap-3 items-start justify-end">
        <Skeleton className="h-10 w-1/2 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      </div>
      <div className="flex gap-3 items-start">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <Skeleton className="h-20 w-2/3 rounded-lg" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-11 flex-1 rounded-lg" />
      <Skeleton className="h-11 w-11 rounded-lg" />
    </div>
  </div>
);

export default ChatbotSkeleton;
