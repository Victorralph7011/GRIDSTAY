import { Star } from "lucide-react";
import type { Review } from "@/lib/firebase/properties";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-gs-lightgrey last:border-b-0">
      <div className="flex items-center gap-1 text-gs-charcoal">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < review.rating ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <p className="text-sm text-gs-charcoal leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
}
