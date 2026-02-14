interface CardSkeletonProps {
  length?: number;
}

const CardSkeleton = ({ length = 10 }: CardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: length })
        .fill(5)
        .map((_, idx) => (
          <div
            key={idx}
            className="bg-gray-primary/30 itmes-center flex h-[154px] w-full animate-pulse gap-4 rounded-2xl p-4 md:h-[372px] md:flex-col md:justify-between"
          >
            <div className="bg-gray-primary h-[120px] w-[120px] shrink-0 animate-pulse rounded-2xl lg:h-[200px] lg:w-full"></div>
            <div className="flex w-full flex-col justify-around gap-2">
              <div className="bg-gray-primary h-[20px] w-2/5 animate-pulse rounded-lg md:w-full" />

              <div className="bg-gray-primary h-[20px] w-full animate-pulse rounded-lg" />

              <div className="bg-gray-primary h-[20px] w-2/5 animate-pulse rounded-lg md:w-full" />

              <div className="bg-gray-primary flex h-[20px] w-3/5 animate-pulse items-center gap-1 rounded-lg md:w-full"></div>
            </div>
          </div>
        ))}
    </>
  );
};

export default CardSkeleton;
