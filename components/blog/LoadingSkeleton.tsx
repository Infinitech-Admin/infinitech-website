export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-video bg-slate-700/50" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-700/50 rounded w-3/4" />
            <div className="h-3 bg-slate-700/50 rounded w-full" />
            <div className="h-3 bg-slate-700/50 rounded w-5/6" />
            <div className="h-3 bg-slate-700/30 rounded w-1/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
