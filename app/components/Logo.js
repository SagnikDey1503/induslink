"use client";

export default function Logo({ className = "h-8", variant = "full", isDark = true }) {
  if (variant === "icon") {
    return (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#d97706"/>
        <path d="M20 10L28 15V25L20 30L12 25V15L20 10Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="4" fill="white"/>
        <path d="M16 20H12M28 20H24M20 16V12M20 28V24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg className="h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#d97706"/>
        <path d="M20 10L28 15V25L20 30L12 25V15L20 10Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="4" fill="white"/>
        <path d="M16 20H12M28 20H24M20 16V12M20 28V24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
        Indus<span className="text-amber-600">Link</span>
      </span>
    </div>
  );
}
