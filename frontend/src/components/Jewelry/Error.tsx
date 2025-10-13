'use client'

import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex gap-1 items-center mt-2 bg-red-600 text-white p-1 rounded-sm"><TriangleAlert />{error.message}</div>
  );
};
