'use client';

import { useEffect } from 'react';
import Logo from '@/components/Logo';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[Rec\'d Global Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ink text-center text-bone">
      <Logo variant="square" size="lg" className="mb-8 opacity-80" />
      <h2 className="text-3xl font-bold font-editorial mb-4">Something went wrong!</h2>
      <p className="text-muted max-w-md mb-8">
        We hit an unexpected error while stamping your taste. This has been logged.
      </p>
      
      <div className="bg-surface/50 p-4 rounded-xl border border-border text-left mb-8 max-w-lg overflow-auto text-sm text-red-400">
        <code>{error.message}</code>
      </div>

      <button
        onClick={() => reset()}
        className="px-8 py-4 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-[0_0_30px_rgba(229,9,20,0.3)]"
      >
        Try again
      </button>
    </div>
  );
}
