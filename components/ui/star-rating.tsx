import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  className?: string
}

/**
 * Star Rating Component
 * Displays a star rating from 0 to maxRating (default 5)
 * Supports half-star ratings (e.g., 4.5)
 */
export function StarRating({
  rating,
  maxRating = 5,
  className,
}: StarRatingProps) {
  // Convert rating to 0-5 scale if it's stored as 0-10 (common pattern)
  // If rating > maxRating, assume it's on a 0-10 scale and divide by 2
  const normalizedRating = rating > maxRating ? rating / 2 : rating
  
  // Clamp rating between 0 and maxRating
  const clampedRating = Math.max(0, Math.min(maxRating, normalizedRating))
  
  // Calculate full stars and whether there's a half star
  const fullStars = Math.floor(clampedRating)
  const hasHalfStar = clampedRating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  // Star SVG path
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg
          key={`full-${i}`}
          className="h-4 w-4 text-yellow-400 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={starPath} />
        </svg>
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative h-4 w-4">
          {/* Empty star background */}
          <svg
            className="absolute h-4 w-4 text-gray-300 dark:text-gray-600"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={starPath} fill="currentColor" />
          </svg>
          {/* Filled half */}
          <svg
            className="absolute h-4 w-4 text-yellow-400 fill-current overflow-hidden"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          >
            <path d={starPath} />
          </svg>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="h-4 w-4 text-gray-300 dark:text-gray-600"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={starPath} fill="currentColor" />
        </svg>
      ))}
    </div>
  )
}

