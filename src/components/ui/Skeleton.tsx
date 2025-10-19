interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

// Card Skeleton para páginas de dashboard
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-800">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-12" />
      </td>
    </tr>
  );
}

// Stat Card Skeleton (para dashboard)
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

// Category Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-3">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

// Goal Card Skeleton
export function GoalCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// Card (cartão de crédito) Skeleton
export function CreditCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 dark:from-neutral-900 dark:to-black rounded-xl p-6 h-48">
      <div className="flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <Skeleton className="h-8 w-8 rounded-lg bg-neutral-700 dark:bg-neutral-800" />
          <Skeleton className="h-6 w-16 bg-neutral-700 dark:bg-neutral-800" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-neutral-700 dark:bg-neutral-800" />
          <Skeleton className="h-6 w-48 bg-neutral-700 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

// List Skeleton (genérico para listas)
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
