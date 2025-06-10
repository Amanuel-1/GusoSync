export default function AnalyticsLoading() {
  return (
    <div className="flex-1 p-6 bg-[#f4f9fc] overflow-auto">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Key Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb] animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb] animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics Sections Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb] animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            
            <div className="mb-6">
              <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Analytics Sections Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb] animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            
            <div className="mb-6">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
