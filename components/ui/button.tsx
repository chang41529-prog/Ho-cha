import * as React from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "default" | "outline" | "ghost"; size?: "default" | "sm"; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant="default", size="default", ...props }, ref) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-8 px-3 text-sm" };
  return <button ref={ref} className={cn("inline-flex items-center justify-center rounded-xl font-bold transition disabled:opacity-50 disabled:pointer-events-none", variants[variant], sizes[size], className)} {...props} />;
});
Button.displayName = "Button";
