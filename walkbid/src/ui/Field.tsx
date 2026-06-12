import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const base =
  'w-full rounded-btn border border-steel bg-graphite px-3 text-[16px] text-chalk placeholder:text-dust ' +
  'focus:border-safety focus:outline-none';

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-dust">
      <span>{children}</span>
      {hint && <span className="text-xs font-normal text-dust/70">{hint}</span>}
    </label>
  );
}

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      {label && <Label hint={hint}>{label}</Label>}
      {children}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, 'min-h-touch', className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'min-h-[96px] py-2.5', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, 'min-h-touch appearance-none', className)} {...rest}>
      {children}
    </select>
  );
}
