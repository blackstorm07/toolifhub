import Image from 'next/image';

export default function AuthorCard({ name, avatar }) {
  const initials =
    name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TH';

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br from-brand-500 to-purple-600">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Written by</p>
        <p className="font-semibold text-base leading-tight">{name}</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Contributor at ToolifHub, helping readers discover the best tools for their workflow.
        </p>
      </div>
    </div>
  );
}
