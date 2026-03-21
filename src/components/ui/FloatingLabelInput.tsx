"use client";

import { forwardRef } from "react";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
}

interface FloatingLabelSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const baseInputClass =
  "peer w-full rounded-xl px-4 pt-6 pb-2 placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-300 bg-white/[0.06] border border-white/10 text-white focus:border-sky-400/60 focus:ring-sky-400/20 focus:shadow-[0_0_20px_rgba(56,189,248,0.1)]";

const labelClass =
  "absolute left-4 top-4 text-sm text-slate-400 transition-all duration-200 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-sky-400 peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-sky-400/60 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider floating-label";

export const FloatingInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, required, className = "", id, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder={label}
          className={`${baseInputClass} ${className}`}
          {...props}
        />
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="text-sky-400 ml-0.5">*</span>}
        </label>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingLabelTextareaProps>(
  ({ label, required, className = "", id, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          placeholder={label}
          className={`${baseInputClass} resize-none ${className}`}
          {...props}
        />
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="text-sky-400 ml-0.5">*</span>}
        </label>
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";

export const FloatingSelect = forwardRef<HTMLSelectElement, FloatingLabelSelectProps>(
  ({ label, required, className = "", id, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`${baseInputClass} ${className}`}
          {...props}
        >
          {children}
        </select>
        <label htmlFor={id} className="absolute left-4 top-1.5 text-[10px] text-sky-400/60 font-semibold uppercase tracking-wider pointer-events-none">
          {label}
          {required && <span className="text-sky-400 ml-0.5">*</span>}
        </label>
      </div>
    );
  }
);
FloatingSelect.displayName = "FloatingSelect";
