'use client';

export default function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[400px]">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-surface border-t-cinema-red animate-spin"></div>
        <div className="absolute inset-3 rounded-full border-4 border-surface border-b-brick animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-muted font-medium animate-pulse">{message}</p>
    </div>
  );
}
