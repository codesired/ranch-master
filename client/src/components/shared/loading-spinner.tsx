export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-light-green flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto"></div>
        <p className="mt-4 text-dark-green">Loading...</p>
      </div>
    </div>
  );
}
