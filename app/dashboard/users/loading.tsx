export default function Loading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f9fc] p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b border-[#d9d9d9] mb-6">
        <div className="h-10 w-32 bg-gray-200 rounded-t-md animate-pulse mr-1"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-t-md animate-pulse mr-1"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-t-md animate-pulse mr-1"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-t-md animate-pulse"></div>
      </div>

      {/* Filters skeleton */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-md shadow-sm p-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden mb-4">
        <div className="h-12 bg-gray-200 animate-pulse"></div>
        <div className="h-16 bg-gray-100 animate-pulse"></div>
        <div className="h-16 bg-white animate-pulse"></div>
        <div className="h-16 bg-gray-100 animate-pulse"></div>
        <div className="h-16 bg-white animate-pulse"></div>
        <div className="h-16 bg-gray-100 animate-pulse"></div>
        <div className="h-16 bg-white animate-pulse"></div>
        <div className="h-16 bg-gray-100 animate-pulse"></div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center gap-1">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
