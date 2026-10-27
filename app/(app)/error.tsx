"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card max-w-lg">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-ink2">{error.message || "Please try again."}</p>
      <button className="btn btn-dark mt-4" onClick={reset}>Try again</button>
    </div>
  );
}
