export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 border-4 border-primary-100 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-t-primary-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
      <p className="text-brand-muted text-sm font-medium">{text}</p>
    </div>
  );
}
