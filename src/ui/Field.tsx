import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[12px] font-bold text-ink-3 uppercase tracking-[0.06em] mb-1.5">
      {children}
    </label>
  );
}

export function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}

const inputBase = [
  'w-full h-11 px-3.5 rounded-btn',
  'bg-section border border-line',
  'text-[15px] text-ink placeholder:text-ink-3',
  'focus:border-primary/50 focus:bg-card focus:ring-2 focus:ring-primary/10',
  'outline-none transition-all duration-150',
].join(' ');

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputBase, 'h-auto py-3 min-h-[96px] resize-none leading-relaxed', className)}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, 'appearance-none pr-9 bg-no-repeat', className)} {...rest}>
      {children}
    </select>
  );
}
