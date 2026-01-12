import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const PageLoader = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Hero section skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96 max-w-full" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-lg">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
};

export default PageLoader;
