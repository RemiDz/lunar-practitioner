'use client';

interface GlassCardProps {
  label: string;
  accentColour?: string;
  fullWidth?: boolean;
  skeleton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function GlassCard({
  label,
  accentColour,
  fullWidth,
  skeleton,
  children,
  className = '',
}: GlassCardProps) {
  return (
    <div
      className={`
        glass-card card-reveal
        p-5 md:p-6
        ${fullWidth ? 'md:col-span-2' : ''}
        ${className}
      `}
    >
      {/* Accent top border */}
      {accentColour && (
        <div
          className="absolute top-0 inset-x-0 h-px transition-colors duration-1000 ease-in-out z-[1]"
          style={{ backgroundColor: accentColour }}
        />
      )}

      {/* Card label */}
      <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-4">
        {label}
      </p>

      {/* Content or skeleton */}
      {skeleton ? (
        <div className="space-y-3">
          <div className="h-5 w-3/4 rounded animate-shimmer" style={{ animationDelay: '0s' }} />
          <div className="h-4 w-1/2 rounded animate-shimmer" style={{ animationDelay: '0.15s' }} />
          <div className="h-4 w-2/3 rounded animate-shimmer" style={{ animationDelay: '0.3s' }} />
          <div className="h-3 w-1/3 rounded animate-shimmer" style={{ animationDelay: '0.45s' }} />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
