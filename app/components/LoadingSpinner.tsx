"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "読み込み中...",
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-12 w-12 border-2",
    lg: "h-16 w-16 border-4"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-[#007B63] border-t-transparent ${sizeClasses[size]}`}
      />
      {text && (
        <p className="mt-3 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
}