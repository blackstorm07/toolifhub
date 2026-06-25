export default function BlogPostLoading() {
  return (
    <div className="page animate-pulse">
      <div className="max-w-[820px] mx-auto space-y-4 mb-8">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-8 w-full bg-muted rounded" />
        <div className="h-8 w-3/4 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
      <div className="max-w-[960px] mx-auto h-64 sm:h-96 w-full bg-muted rounded-2xl mb-10" />
      <div className="max-w-[820px] mx-auto space-y-3">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
      </div>
    </div>
  );
}
