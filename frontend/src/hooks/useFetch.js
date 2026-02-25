// hooks/useFetch.js
// ─────────────────────────────────────────────────────────────────────────────
// Generic data-fetching hook.
//
// Usage:
//   const { data, loading, error, refetch } = useFetch(
//     () => someApiFunction(arg1, arg2),   // ← pass a zero-arg factory
//     [arg1, arg2]                          // ← deps that should trigger a re-fetch
//   );
//
// • apiFn  – a zero-argument async function (wrap any args in the closure).
// • deps   – React dependency array; a new fetch fires whenever deps change.
// • refetch – call this manually to force a re-fetch (e.g. after a mutation).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

export function useFetch(apiFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Keep a stable ref to the latest apiFn so refetch() always calls the
  // most-recent version without needing it in the useCallback dep array.
  const apiFnRef = useRef(apiFn);
  useEffect(() => { apiFnRef.current = apiFn; });

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFnRef.current();
      setData(result);
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // re-create (and therefore re-run) when deps change

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
