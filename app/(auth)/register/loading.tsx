export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0097fb] mb-4"></div>
        <p className="text-[#7d7d7d]">Loading registration form...</p>
      </div>
    </div>
  )
}
