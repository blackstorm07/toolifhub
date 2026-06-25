export default function CategoryLoading() {
  return (
    <div className="page animate-pulse">
      <div className="h-8 w-64 bg-muted rounded mb-3" />
      <div className="h-4 w-96 bg-muted rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
