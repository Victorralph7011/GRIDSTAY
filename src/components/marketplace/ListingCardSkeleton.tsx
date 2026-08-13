export default function ListingCardSkeleton() {
  return (
    <div>
      <div className="w-full aspect-[4/3] rounded-2xl bg-gs-lightgrey animate-pulse" />
      <div className="pt-3.5 flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded bg-gs-lightgrey animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-gs-lightgrey animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-gs-lightgrey animate-pulse mt-1" />
      </div>
    </div>
  );
}
