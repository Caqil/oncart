"use client";

import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  allowHalf?: boolean;
  className?: string;
  precision?: number;
}

export function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
  showCount = false,
  count,
  allowHalf = true,
  className,
  precision = 0.5,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleMouseEnter = (value: number) => {
    if (!readonly && onRatingChange) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly && onRatingChange) {
      setHoverRating(null);
    }
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const renderStar = (index: number) => {
    const value = index + 1;
    const filled = displayRating >= value;
    const halfFilled =
      allowHalf && displayRating >= value - 0.5 && displayRating < value;

    return (
      <button
        key={index}
        type="button"
        className={cn(
          "relative transition-colors",
          !readonly && onRatingChange && "hover:scale-110 cursor-pointer",
          readonly && "cursor-default"
        )}
        onMouseEnter={() => handleMouseEnter(value)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(value)}
        disabled={readonly}
      >
        {halfFilled ? (
          <div className="relative">
            <Star className={cn(sizeClasses[size], "text-muted-foreground")} />
            <StarHalf
              className={cn(
                sizeClasses[size],
                "absolute top-0 left-0 text-yellow-400 fill-yellow-400"
              )}
            />
          </div>
        ) : (
          <Star
            className={cn(
              sizeClasses[size],
              filled
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground"
            )}
          />
        )}
      </button>
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>

      {showValue && (
        <span className={cn("font-medium", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}

      {showCount && count !== undefined && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
