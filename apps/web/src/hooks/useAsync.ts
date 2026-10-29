"use client";

import { useCallback, useEffect, useState } from "react";

interface AsyncState<T> {
  data?: T;
  error: string;
  loading: boolean;
  requestKey: string | null;
  requestNonce: number;
}

export function useAsync<T>(
  fn: () => Promise<T>,
  requestKey: string,
  enabled = true,
) {
  const [state, setState] = useState<AsyncState<T>>({
    error: "",
    loading: false,
    requestKey: null,
    requestNonce: -1,
  });

  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    fn()
      .then((data) => {
        if (!active) return;

        setState({
          data,
          error: "",
          loading: false,
          requestKey,
          requestNonce: nonce,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState((previous) => ({
          data: previous.data,
          error:
            error instanceof Error ? error.message : "Something went wrong.",
          loading: false,
          requestKey,
          requestNonce: nonce,
        }));
      });

    return () => {
      active = false;
    };
  }, [enabled, fn, nonce, requestKey]);

  const reload = useCallback(() => {
    setNonce((value) => value + 1);
  }, []);

  const currentRequest =
    state.requestKey === requestKey && state.requestNonce === nonce;

  return {
    data: state.data,
    error: currentRequest ? state.error : "",
    loading: enabled && !currentRequest,
    reload,
  };
}
