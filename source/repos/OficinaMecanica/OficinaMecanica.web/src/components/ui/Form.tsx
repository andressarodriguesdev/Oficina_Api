import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-graphite-300 mb-1.5">
      {children}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export function Input({ label, icon, className = '', id, ...props }: InputProps) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400">{icon}</span>
        )}
        <input
          id={id}
          className={`input-field ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, children, id, className = '', ...props }: SelectProps) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        id={id}
        className={`input-field appearance-none bg-graphite-800 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <textarea
        id={id}
        className={`input-field resize-none ${className}`}
        rows={3}
        {...props}
      />
    </div>
  );
}
