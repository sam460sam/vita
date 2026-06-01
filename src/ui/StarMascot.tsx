import { cn } from '@/lib/cn';

/**
 * Stella — the friendly star mascot. Pure SVG so it scales crisply and can be
 * animated. Used as the app's brand character and the in-app helper.
 */
export function StarMascot({
  size = 96,
  className,
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-stella-float', className)}
      role="img"
      aria-label="Stella"
    >
      {/* soft shadow */}
      <ellipse cx="60" cy="104" rx="22" ry="5" fill="#FCE9A6" opacity="0.6" />
      {/* rounded 5-point star body, slightly tilted */}
      <g transform="rotate(-8 60 58)">
        <path
          d="M60 16c4.6 0 7.9 4.7 11.6 8.2 3.2 3 7.8 2.6 12.4 3.3 5.6.8 9 2.9 9.9 7.4.8 4-1.7 8-2 12.6-.3 4.2 2.4 8.2 2.2 12.3-.2 5-3.2 8.2-8.4 8.9-4.3.6-8.7-1.6-13-.7-4.4.9-7.9 5-11.8 7.6-4.6 3-8.6 2.7-11.6-1.2-2.6-3.4-3.2-8.4-6.2-11.6-2.9-3.1-7.9-4-11.4-6.8-4.2-3.3-5.3-7.4-2.8-11.7 2.1-3.7 6.7-5.8 8.6-9.7 1.8-3.6 1.6-8.6 3.9-12.2C53.4 19 56.2 16 60 16z"
          fill="#FFC93C"
        />
      </g>
      {/* eyes */}
      <circle cx="49" cy="60" r="6.5" fill="#1B1B2F" />
      <circle cx="51" cy="58" r="2" fill="#fff" />
      <circle cx="73" cy="52" r="7" fill="#1B1B2F" />
      <circle cx="75" cy="50" r="2.2" fill="#fff" />
      {/* mouth */}
      <ellipse cx="62" cy="66" rx="4.5" ry="3.2" transform="rotate(20 62 66)" fill="#FF4D5E" />
    </svg>
  );
}
