export default function CardSkeleton() {
  return (
    <div className="bg-gray-800 shadow-md rounded-xl p-5 border border-gray-700 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-2/3 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-5"></div>
      <div className="flex justify-end mt-2">
        <div className="h-8 w-20 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
