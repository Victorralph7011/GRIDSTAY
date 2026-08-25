import type { Review } from "@/lib/firebase/properties";
import ReviewCard from "./ReviewCard";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gs-midgrey">
        No reviews yet — be the first to stay and share your experience.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
