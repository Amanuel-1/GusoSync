export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f4f9fc]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0097fb]"></div>
        <h2 className="mt-6 text-xl font-medium text-[#103a5e]">Loading Dashboard</h2>
        <p className="mt-2 text-[#7d7d7d]">Please wait while we fetch the latest data...</p>
      </div>
    </div>
  )
}
